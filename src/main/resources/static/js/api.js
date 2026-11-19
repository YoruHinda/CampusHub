// Quando o frontend estiver dentro de static/ (mesma origem), troque por '/api'
const BASE = 'http://localhost:8080/api';
const POSTS = `${BASE}/posts`;
const COMMUNITIES = `${BASE}/communities`;

async function request(url, options = {}) {
    const res = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
    });

    if (!res.ok) {
        let message = 'Erro ' + res.status;
        try {
            const err = await res.json();
            message = err.fieldErrors
                ? Object.values(err.fieldErrors).join(' · ')
                : (err.message || message);
        } catch (e) { /* corpo sem JSON */ }
        throw new Error(message);
    }
    return res.status === 204 ? null : res.json();
}

const api = {
    // posts
    listPosts: (communityId) => request(communityId ? `${POSTS}?communityId=${communityId}` : POSTS),
    getPost: (id) => request(`${POSTS}/${id}`),
    createPost: (data) => request(POSTS, { method: 'POST', body: JSON.stringify(data) }),
    updatePost: (id, data) => request(`${POSTS}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deletePost: (id) => request(`${POSTS}/${id}`, { method: 'DELETE' }),
    pin: (id) => request(`${POSTS}/${id}/pin`, { method: 'PATCH' }),
    unpin: (id) => request(`${POSTS}/${id}/unpin`, { method: 'PATCH' }),
    listComments: (id) => request(`${POSTS}/${id}/comments`),
    addComment: (id, content) => request(`${POSTS}/${id}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
    vote: (id, type) => request(`${POSTS}/${id}/votes`, { method: 'POST', body: JSON.stringify({ type }) }),

    // comunidades
    listCommunities: () => request(COMMUNITIES),
    getCommunity: (id) => request(`${COMMUNITIES}/${id}`),
    createCommunity: (data) => request(COMMUNITIES, { method: 'POST', body: JSON.stringify(data) }),
    updateCommunity: (id, data) => request(`${COMMUNITIES}/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCommunity: (id) => request(`${COMMUNITIES}/${id}`, { method: 'DELETE' })
};

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text ?? '';
    return div.innerHTML;
}

function initials(name, size = 2) {
    return (name || 'CH').trim().slice(0, size).toUpperCase();
}

function timeAgo(isoDate) {
    const diff = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
    if (diff < 60) return 'agora';
    if (diff < 3600) return `há ${Math.floor(diff / 60)} min`;
    if (diff < 86400) return `há ${Math.floor(diff / 3600)} h`;
    if (diff < 2592000) return `há ${Math.floor(diff / 86400)} d`;
    return new Date(isoDate).toLocaleDateString('pt-BR');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3500);
}