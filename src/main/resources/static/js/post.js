const postId = new URLSearchParams(location.search).get('id');
let currentPost = null;
let currentCommunity = null;

const $ = (id) => document.getElementById(id);

async function init() {
    if (!postId) {
        showError('Publicação não informada.');
        return;
    }
    try {
        const [post, comments] = await Promise.all([api.getPost(postId), api.listComments(postId)]);
        currentPost = post;
        renderPost();
        renderComments(comments);
    } catch (e) {
        showError(e.message);
    }
    const [post, comments] = await Promise.all([api.getPost(postId), api.listComments(postId)]);
    currentPost = post;
    if (post.communityId) {
        try { currentCommunity = await api.getCommunity(post.communityId); } catch (e) { /* segue sem sidebar */ }
    }
    renderPost();
    renderComments(comments);
}

function showError(message) {
    document.querySelector('.main-content').innerHTML =
        `<article class="post-card"><h1>Ops!</h1><p>${escapeHtml(message)}</p>
         <p><a href="/index.html">← Voltar ao início</a></p></article>`;
}

/* ---------- publicação ---------- */

function renderPost() {
    const p = currentPost;
    document.title = p.title + ' — CampusHub';

        // no lugar de: $('post-community').textContent = 'CampusHub';
    $('post-community').innerHTML = p.communityId
        ? `<a href="/community.html?id=${p.communityId}">${escapeHtml(p.communityName)}</a>`
        : 'Sem comunidade';
    $('post-author').textContent = 'Publicado ' + timeAgo(p.createdAt);
    $('post-title').textContent = p.title;
    $('post-content').textContent = p.content;
    $('post-content').style.whiteSpace = 'pre-wrap';
    $('post-tags').innerHTML = p.pinned ? '<span class="badge-pinned">📌 Fixado</span>' : '';

    $('post-votes').innerHTML = `
        <button class="action" data-action="up">↑</button>
        <strong id="score">${p.score}</strong>
        <button class="action" data-action="down">↓</button>`;

    renderOwnerActions();

        // no lugar do bloco "Barra lateral: comunidades serão implementadas depois"
    if (currentCommunity) {
        $('community-description').textContent = currentCommunity.description || 'Esta comunidade ainda não tem descrição.';
        $('community-members').textContent = currentCommunity.postCount;
        $('community-online').textContent = new Date(currentCommunity.createdAt).toLocaleDateString('pt-BR');
    } else {
        $('community-description').textContent = 'Esta publicação não pertence a nenhuma comunidade.';
        $('community-members').textContent = '—';
        $('community-online').textContent = '—';
    }
}

function renderOwnerActions() {
    let box = document.getElementById('post-manage');
    if (!box) {
        box = document.createElement('div');
        box.id = 'post-manage';
        box.className = 'post-manage';
        document.querySelector('.post-actions').appendChild(box);
    }
    box.innerHTML = `
        <button class="action ${currentPost.pinned ? 'active' : ''}" data-action="pin">📌 ${currentPost.pinned ? 'Desafixar' : 'Fixar'}</button>
        <button class="action" data-action="edit">✎ Editar</button>
        <button class="action danger" data-action="delete">🗑 Excluir</button>`;
}

document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn || !currentPost) return;

    try {
        switch (btn.dataset.action) {
            case 'up':
            case 'down': {
                const summary = await api.vote(postId, btn.dataset.action === 'up' ? 'UP' : 'DOWN');
                currentPost.score = summary.score;
                $('score').textContent = summary.score;
                break;
            }
            case 'pin':
                currentPost = currentPost.pinned ? await api.unpin(postId) : await api.pin(postId);
                $('post-tags').innerHTML = currentPost.pinned ? '<span class="badge-pinned">📌 Fixado</span>' : '';
                renderOwnerActions();
                break;
            case 'edit':
                startEdit();
                break;
            case 'delete':
                if (confirm('Excluir esta publicação? Os comentários e votos também serão removidos.')) {
                    await api.deletePost(postId);
                    location.href = '/index.html';
                }
                break;
        }
    } catch (err) {
        showToast(err.message);
    }
});

/* ---------- edição ---------- */

function startEdit() {
    $('post-title').innerHTML = `<input id="edit-title" class="edit-field" maxlength="200">`;
    $('post-content').innerHTML = `
        <textarea id="edit-content" class="edit-field" rows="8"></textarea>
        <div class="edit-actions">
            <button type="button" class="action" id="edit-save">Salvar</button>
            <button type="button" class="action" id="edit-cancel">Cancelar</button>
        </div>`;
    $('edit-title').value = currentPost.title;
    $('edit-content').value = currentPost.content;

    $('edit-cancel').onclick = renderPost;
    $('edit-save').onclick = async () => {
        try {
            currentPost = await api.updatePost(postId, {
                title: $('edit-title').value,
                content: $('edit-content').value
            });
            renderPost();
            showToast('Publicação atualizada.');
        } catch (err) {
            showToast(err.message);
        }
    };
}

/* ---------- comentários ---------- */

function renderComments(comments) {
    const list = $('comment-list');
    $('comments-count').textContent = `(${comments.length})`;

    if (comments.length === 0) {
        list.innerHTML = '<p id="empty-comments">Nenhum comentário encontrado.</p>';
        return;
    }
    list.innerHTML = comments.map(c => `
        <div class="comment">
            <small>${timeAgo(c.createdAt)}</small>
            <p style="white-space:pre-wrap">${escapeHtml(c.content)}</p>
        </div>`).join('');
}

$('comment-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const textarea = $('comment-content');
    const content = textarea.value.trim();
    if (!content) return;

    try {
        await api.addComment(postId, content);
        textarea.value = '';
        renderComments(await api.listComments(postId));
    } catch (err) {
        showToast(err.message);
    }
});

init();