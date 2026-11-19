const state = { posts: [], communities: [], filter: 'all', sort: 'relevant' };

const postsEl = document.getElementById('posts');
const communityListEl = document.getElementById('communityList');
const EMPTY_POSTS_HTML = postsEl.innerHTML;
const EMPTY_COMMUNITIES_HTML = communityListEl.innerHTML;

/* ---------- comunidades ---------- */

async function loadCommunities() {
    try {
        state.communities = await api.listCommunities();
        renderCommunities();
    } catch (e) {
        showToast('Não foi possível carregar as comunidades: ' + e.message);
    }
}

function renderCommunities() {
    if (state.communities.length === 0) {
        communityListEl.innerHTML = EMPTY_COMMUNITIES_HTML;
    } else {
        communityListEl.innerHTML = state.communities.map(c => `
            <a class="community" href="/community.html?id=${c.id}">
                <div class="community-icon">${escapeHtml(initials(c.name, 3))}</div>
                <div class="community-info">
                    <strong>${escapeHtml(c.name)}</strong>
                    <small>${c.postCount} ${c.postCount === 1 ? 'publicação' : 'publicações'}</small>
                </div>
            </a>`).join('');
    }

    // opções do select do modal de publicação
    const select = document.getElementById('communitySelect');
    const previous = select.value;
    select.innerHTML = '<option value="" disabled selected>Selecione a comunidade</option>' +
        state.communities.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
    if (previous) select.value = previous;
}

/* ---------- publicações ---------- */

async function loadPosts() {
    try {
        state.posts = await api.listPosts();
        render();
    } catch (e) {
        showToast('Não foi possível carregar as publicações: ' + e.message);
    }
}

function visiblePosts() {
    let list = [...state.posts]; // já vem com fixados primeiro e mais recentes

    if (state.filter === 'popular') {
        list = list.filter(p => p.score > 0).sort((a, b) => b.score - a.score);
    } else if (state.filter === 'recent') {
        list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (state.sort === 'relevant') {
        list.sort((a, b) => (b.pinned - a.pinned) || (b.score - a.score)
            || (new Date(b.createdAt) - new Date(a.createdAt)));
    }
    return list;
}

function render() {
    const list = visiblePosts();
    if (list.length === 0) {
        postsEl.className = 'empty-state';
        postsEl.innerHTML = EMPTY_POSTS_HTML;
        return;
    }
    postsEl.className = '';
    postsEl.innerHTML = list.map(postCard).join('');
}

function postCard(p) {
    const preview = p.content.length > 300 ? p.content.slice(0, 300) + '…' : p.content;
    const communityLabel = p.communityId
        ? `<a class="post-link" href="/community.html?id=${p.communityId}">${escapeHtml(p.communityName)}</a>`
        : 'Sem comunidade';

    return `
    <article class="post" data-id="${p.id}">
        <div class="post-head">
            <div class="community-icon">${escapeHtml(initials(p.communityName))}</div>
            <div class="post-by">
                <strong>${communityLabel}${p.pinned ? ' <span class="badge-pinned">📌 Fixado</span>' : ''}</strong>
                <small>${timeAgo(p.createdAt)}</small>
            </div>
        </div>
        <h3><a class="post-link" href="/post.html?id=${p.id}">${escapeHtml(p.title)}</a></h3>
        <p>${escapeHtml(preview)}</p>
        <div class="actions">
            <button class="action" data-action="up">↑ <span class="score">${p.score}</span></button>
            <button class="action" data-action="down">↓</button>
            <a class="action" href="/post.html?id=${p.id}">▢ <span>${p.commentCount} comentários</span></a>
            <button class="action ${p.pinned ? 'active' : ''}" data-action="pin">📌 <span>${p.pinned ? 'Desafixar' : 'Fixar'}</span></button>
            <button class="action share" data-action="share">↗ <span>Enviar</span></button>
        </div>
    </article>`;
}

/* ---------- ações nos cards (delegação de eventos) ---------- */

postsEl.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const card = btn.closest('.post');
    const id = Number(card.dataset.id);
    const post = state.posts.find(p => p.id === id);

    try {
        switch (btn.dataset.action) {
            case 'up':
            case 'down': {
                const type = btn.dataset.action === 'up' ? 'UP' : 'DOWN';
                const summary = await api.vote(id, type);
                post.upvotes = summary.upvotes;
                post.downvotes = summary.downvotes;
                post.score = summary.score;
                card.querySelector('.score').textContent = summary.score;
                break;
            }
            case 'pin': {
                if (post.pinned) await api.unpin(id); else await api.pin(id);
                await loadPosts(); // a ordem muda ao fixar/desafixar
                break;
            }
            case 'share': {
                const url = `${location.origin}/post.html?id=${id}`;
                if (navigator.share) {
                    await navigator.share({ title: 'CampusHub', text: post.title, url });
                } else if (navigator.clipboard) {
                    await navigator.clipboard.writeText(url);
                    showToast('Link copiado!');
                }
                break;
            }
        }
    } catch (err) {
        if (err.name !== 'AbortError') showToast(err.message);
    }
});

/* ---------- abas e ordenação ---------- */

document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.filter = tab.dataset.filter;
        render();
    });
});

document.querySelector('.sort').addEventListener('change', (e) => {
    state.sort = e.target.selectedIndex === 0 ? 'relevant' : 'recent';
    if (state.sort === 'recent' && state.filter === 'all') {
        state.posts.sort((a, b) => (b.pinned - a.pinned) || (new Date(b.createdAt) - new Date(a.createdAt)));
    }
    render();
});

/* ---------- modal: criar publicação ---------- */

const modal = document.getElementById('modal');

function openModal(prefill) {
    if (state.communities.length === 0) {
        showToast('Crie uma comunidade antes de publicar.');
        openCommunityModal();
        return;
    }
    if (prefill) {
        document.getElementById('title').value = prefill.title;
        document.getElementById('bodyText').value = prefill.body;
    }
    modal.classList.add('open');
    document.getElementById(prefill ? 'communitySelect' : 'title').focus();
}
function closeModal() { modal.classList.remove('open'); }
modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });

document.getElementById('postForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('title').value.trim();
    const content = document.getElementById('bodyText').value.trim();
    const communityId = Number(document.getElementById('communitySelect').value);
    if (!title || !content || !communityId) return;

    try {
        await api.createPost({ title, content, communityId });
        e.target.reset();
        closeModal();
        await Promise.all([loadPosts(), loadCommunities()]);
        document.querySelector('[data-filter="all"]').click();
    } catch (err) {
        showToast(err.message);
    }
});

// Publicação rápida: abre o modal com o texto preenchido para escolher a comunidade
document.getElementById('quickPostForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('quickPostText');
    const text = input.value.trim();
    if (!text) return;

    const title = text.length > 80 ? text.slice(0, 77) + '…' : text;
    openModal({ title, body: text });
    input.value = '';
});

/* ---------- modal: criar comunidade ---------- */

const communityModal = document.getElementById('communityModal');

function openCommunityModal() {
    communityModal.classList.add('open');
    document.getElementById('communityNameInput').focus();
}
function closeCommunityModal() { communityModal.classList.remove('open'); }
communityModal.addEventListener('click', e => { if (e.target === communityModal) closeCommunityModal(); });

document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeModal(); closeCommunityModal(); }
});

document.getElementById('communityForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('communityNameInput').value.trim();
    const description = document.getElementById('communityDescInput').value.trim();
    if (!name) return;

    try {
        await api.createCommunity({ name, description });
        e.target.reset();
        closeCommunityModal();
        await loadCommunities();
        showToast('Comunidade criada!');
    } catch (err) {
        showToast(err.message);
    }
});

loadCommunities();
loadPosts();