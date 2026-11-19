const PAGE_SIZE = 9;
const $ = (id) => document.getElementById(id);

const state = { all: [], search: '', sort: 'popular', page: 1 };

/* ---------- carregamento ---------- */

async function init() {
    // Categorias ainda não existem no backend
    const categories = $('categories-list').closest('section');
    if (categories) categories.hidden = true;

    $('loading-state').hidden = false;
    try {
        state.all = await api.listCommunities();
    } catch (e) {
        showToast('Não foi possível carregar as comunidades: ' + e.message);
    } finally {
        $('loading-state').hidden = true;
    }
    render();
}

/* ---------- filtro, ordenação e paginação ---------- */

function filteredCommunities() {
    const term = state.search.toLowerCase();
    const list = state.all.filter(c =>
        !term ||
        c.name.toLowerCase().includes(term) ||
        (c.description || '').toLowerCase().includes(term)
    );

    const byName = (a, b) => a.name.localeCompare(b.name, 'pt-BR');
    const byDate = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);

    switch (state.sort) {
        case 'recent': list.sort(byDate); break;
        case 'name': list.sort(byName); break;
        default: list.sort((a, b) => (b.postCount - a.postCount) || byName(a, b));
    }
    return list;
}

function render() {
    const list = filteredCommunities();
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    state.page = Math.min(state.page, totalPages);

    const start = (state.page - 1) * PAGE_SIZE;
    const pageItems = list.slice(start, start + PAGE_SIZE);

    $('communities-grid').innerHTML = pageItems.map(card).join('');
    $('empty-state').hidden = list.length > 0;

    $('communities-description').textContent = list.length === 0
        ? 'Nenhuma comunidade encontrada.'
        : `${list.length} ${list.length === 1 ? 'comunidade disponível' : 'comunidades disponíveis'}.`;

    // paginação
    $('pagination').hidden = totalPages <= 1;
    $('page-indicator').textContent = `Página ${state.page} de ${totalPages}`;
    $('previous-page').disabled = state.page <= 1;
    $('next-page').disabled = state.page >= totalPages;
}

function card(c) {
    const description = c.description || 'Esta comunidade ainda não tem descrição.';
    const posts = `${c.postCount} ${c.postCount === 1 ? 'publicação' : 'publicações'}`;
    return `
    <a class="ex-card" href="/community.html?id=${c.id}">
        <div class="ex-card-top">
            <div class="ex-avatar">${escapeHtml(initials(c.name))}</div>
            <h3>${escapeHtml(c.name)}</h3>
        </div>
        <p>${escapeHtml(description)}</p>
        <div class="ex-card-meta">
            <span>${posts}</span>
            <span>Criada em ${new Date(c.createdAt).toLocaleDateString('pt-BR')}</span>
        </div>
    </a>`;
}

/* ---------- eventos ---------- */

function applySearch() {
    state.search = $('community-search').value.trim();
    state.page = 1;
    render();
}

$('community-search').addEventListener('input', applySearch);
$('search-button').addEventListener('click', applySearch);
$('community-search').addEventListener('keydown', (e) => { if (e.key === 'Enter') applySearch(); });

$('community-sort').addEventListener('change', (e) => {
    state.sort = e.target.value;
    state.page = 1;
    render();
});

$('previous-page').addEventListener('click', () => { state.page--; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
$('next-page').addEventListener('click', () => { state.page++; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

init();