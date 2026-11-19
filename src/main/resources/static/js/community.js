const communityId = new URLSearchParams(location.search).get('id');
const $ = (id) => document.getElementById(id);

const state = { community: null, posts: [], sort: 'recent', search: '' };

/* ---------- carregamento ---------- */

async function init() {
    if (!communityId) {
        showError('Comunidade não informada.');
        return;
    }
    try {
        const [community, posts] = await Promise.all([
            api.getCommunity(communityId),
            api.listPosts(communityId)
        ]);
        state.community = community;
        state.posts = posts;
        renderCommunity();
        renderPosts();
    } catch (e) {
        showError(e.message);
    }
}

async function reload() {
    const [community, posts] = await Promise.all([
        api.getCommunity(communityId),
        api.listPosts(communityId)
    ]);
    state.community = community;
    state.posts = posts;
    renderCommunity();
    renderPosts();
}

function showError(message) {
    document.querySelector('.container').innerHTML =
        `<section class="sidebar-card"><h1>Ops!</h1><p>${escapeHtml(message)}</p>
         <p><a href="/index.html">← Voltar ao início</a></p></section>`;
}

/* ---------- cabeçalho e sidebar ---------- */

function hide(el) { if (el) el.style.display = 'none'; }

function renderCommunity() {
    const c = state.community;
    const description = c.description || 'Esta comunidade ainda não tem descrição.';
    const count = `${c.postCount} ${c.postCount === 1 ? 'publicação' : 'publicações'}`;

    document.title = c.name + ' — CampusHub';

    $('community-avatar').textContent = initials(c.name);
    $('community-name').textContent = c.name;
    $('community-description').textContent = description;
    $('community-members').textContent = count;
    $('community-created').textContent = 'Criada em ' + new Date(c.createdAt).toLocaleDateString('pt-BR');

    $('sidebar-description').textContent = description;
    $('sidebar-post-count').textContent = c.postCount;

    // Recursos que dependem de usuários / ainda sem suporte no backend
    hide($('join-community'));
    hide($('community-category'));
    hide($('sidebar-members').parentElement);
    hide($('sidebar-online').parentElement);
    hide($('rules-card'));
}

/* ---------- publicações ---------- */

function byDateDesc(a, b) { return new Date(b.createdAt) - new Date(a.createdAt); }

function sortPosts(list) {
    return [...list].sort(state.sort === 'popular'
        ? (a, b) => (b.score - a.score) || byDateDesc(a, b)
        : byDateDesc);
}

function matchesSearch(p) {
    if (!state.search) return true;
    const term = state.search.toLowerCase();
    return p.title.toLowerCase().includes(term) || p.content.toLowerCase().includes(term);
}

function renderPosts() {
    const filtered = state.posts.filter(matchesSearch);
    const pinned = sortPosts(filtered.filter(p => p.pinned));
    const others = sortPosts(filtered.filter(p => !p.pinned));

    $('pinned-section').hidden = pinned.length === 0;
    $('pinned-posts').innerHTML = pinned.map(postCard).join('');
    $('community-posts').innerHTML = others.map(postCard).join('');

    const empty = $('posts-empty');
    empty.hidden = filtered.length > 0;
    if (filtered.length === 0) {
        empty.querySelector('p').textContent = state.search
            ? 'Nenhuma publicação corresponde à sua busca.'
            : 'Esta comunidade ainda não possui publicações.';
    }
}

function postCard(p) {
    const preview = p.content.length > 300 ? p.content.slice(0, 300) + '…' : p.content;
    return `
    <article class="post-item" data-id="${p.id}">
        <div class="post-item-header">
            ${p.pinned ? '<span class="pinned-label">📌 Fixado</span>' : ''}
            <span>${timeAgo(p.createdAt)}</span>
        </div>
        <h3><a class="post-link" href="/post.html?id=${p.id}">${escapeHtml(p.title)}</a></h3>
        <p>${escapeHtml(preview)}</p>
        <div class="post-item-footer">
            <button class="foot-btn" data-action="up" type="button">↑ <span class="score">${p.score}</span></button>
            <button class="foot-btn" data-action="down" type="button">↓</button>
            <a class="foot-btn" href="/post.html?id=${p.id}">▢ ${p.commentCount} comentários</a>
            <button class="foot-btn ${p.pinned ? 'active' : ''}" data-action="pin" type="button">📌 ${p.pinned ? 'Desafixar' : 'Fixar'}</button>
            <button class="foot-btn" data-action="share" type="button">↗ Enviar</button>
        </div>
    </article>`;
}
/* ---------- ações nos cards (delegação de eventos) ---------- */

document.querySelector('.community-main').addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;

    const card = btn.closest('.post-item');
    const id = Number(card.dataset.id);
    const post = state.posts.find(p => p.id === id);

    try {
        switch (btn.dataset.action) {
            case 'up':
            case 'down': {
                const summary = await api.vote(id, btn.dataset.action === 'up' ? 'UP' : 'DOWN');
                post.upvotes = summary.upvotes;
                post.downvotes = summary.downvotes;
                post.score = summary.score;
                card.querySelector('.score').textContent = summary.score;
                break;
            }
            case 'pin':
                if (post.pinned) await api.unpin(id); else await api.pin(id);
                await reload();
                break;
            case 'share': {
                const url = `${location.origin}/post.html?id=${id}`;
                if (navigator.share) {
                    await navigator.share({ title: state.community.name, text: post.title, url });
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

/* ---------- abas e busca ---------- */

document.querySelectorAll('.tab-button').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab-button').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        state.sort = tab.dataset.sort;
        renderPosts();
    });
});

$('post-search').addEventListener('input', (e) => {
    state.search = e.target.value.trim();
    renderPosts();
});

/* ---------- modal: criar publicação ---------- */

const postModal = $('post-modal');

function openPostModal() {
    postModal.classList.add('open');
    $('post-title-input').focus();
}
function closePostModal() { postModal.classList.remove('open'); }

$('create-post').addEventListener('click', openPostModal);
$('post-modal-close').addEventListener('click', closePostModal);
$('post-modal-cancel').addEventListener('click', closePostModal);
postModal.addEventListener('click', (e) => { if (e.target === postModal) closePostModal(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePostModal(); });

$('post-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = $('post-title-input').value.trim();
    const content = $('post-body-input').value.trim();
    if (!title || !content) return;

    try {
        await api.createPost({ title, content, communityId: Number(communityId) });
        e.target.reset();
        closePostModal();
        await reload();
        showToast('Publicação criada!');
    } catch (err) {
        showToast(err.message);
    }
});

init();