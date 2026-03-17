/**
 * Agocare Dynamic Q&A Feed
 * Replaces hardcoded question cards with data fetched from the API.
 * Drop-in script for index.html — works with the existing DOM structure.
 */

// ─── State ────────────────────────────────────────────────────────
let currentPage = 0;
const PAGE_SIZE = 10;
let currentSort = 'newest';
let currentCategory = null;
let isLoading = false;
let hasMore = true;

// Category badge colors (matches the old hardcoded styles)
const CATEGORY_COLORS = {
    'infectious-diseases': { bg: '#fef3c7', color: '#92400e', icon: '🦠' },
    'pregnancy-care':      { bg: '#fce7f3', color: '#be185d', icon: '🤰' },
    'child-nutrition':     { bg: '#dbeafe', color: '#1e40af', icon: '🍎' },
    'mental-wellness':     { bg: '#ede9fe', color: '#5b21b6', icon: '🧠' },
    'diabetes':            { bg: '#fef9c3', color: '#854d0e', icon: '💉' },
    'pediatrics':          { bg: '#dbeafe', color: '#1e40af', icon: '👶' },
    'sexual-health':       { bg: '#d1fae5', color: '#065f46', icon: '💚' },
    'general-health':      { bg: '#f3f4f6', color: '#374151', icon: '🏥' },
    'hypertension':        { bg: '#fee2e2', color: '#991b1b', icon: '❤️' }
};

// Avatar gradient colors by first letter
const AVATAR_GRADIENTS = [
    'linear-gradient(135deg, #0d9488, #14b8a6)',
    'linear-gradient(135deg, #ec4899, #f472b6)',
    'linear-gradient(135deg, #8b5cf6, #a78bfa)',
    'linear-gradient(135deg, #0ea5e9, #3b82f6)',
    'linear-gradient(135deg, #10b981, #059669)',
    'linear-gradient(135deg, #f59e0b, #fbbf24)',
    'linear-gradient(135deg, #ef4444, #f87171)',
];

function getAvatarGradient(name) {
    if (!name) return AVATAR_GRADIENTS[0];
    const idx = name.charCodeAt(0) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[idx];
}

// ─── Rendering ────────────────────────────────────────────────────

function renderQuestionCard(q) {
    const author = q.author || {};
    const stats = q.stats || {};
    const category = q.category || {};
    const catStyle = CATEGORY_COLORS[category.slug] || { bg: '#f3f4f6', color: '#374151', icon: '❓' };

    const initials = author.initials || '?';
    const authorName = q.isAnonymous ? 'Anonymous' : (author.name || author.username || 'Anonymous');
    const verifiedBadge = author.verificationBadge
        ? '<span class="q-verified" title="Verified">✓</span>' : '';

    const medicalBanner = stats.medicalAnswers > 0
        ? `<div class="q-medical-banner">
             <span>✅</span> ${stats.medicalAnswers} answer${stats.medicalAnswers > 1 ? 's' : ''} from medical professionals
           </div>` : '';

    return `
    <article class="q-card" data-question-id="${q.id}" data-category="${category.slug || ''}">
        <div class="q-card-body">
            <!-- Author Row (Twitter-style: avatar + name left, timestamp right) -->
            <div class="q-author-row">
                <div class="q-avatar" style="background:${getAvatarGradient(authorName)};">
                    ${initials}
                </div>
                <div class="q-author-info">
                    <div class="q-author-name">${escapeHtml(authorName)}${verifiedBadge}</div>
                    <div class="q-author-meta">
                        <span>${category.name || 'General'}</span>
                        <span class="dot"></span>
                        <span>${stats.views || 0} views</span>
                    </div>
                </div>
                <span class="q-timestamp">${q.timeAgo || ''}</span>
            </div>

            <!-- Topic Tag (hashtag pill) -->
            <span class="q-topic-tag" style="background:${catStyle.bg};color:${catStyle.color};">
                ${catStyle.icon} ${category.name || 'General'}
            </span>

            <!-- Title & Content -->
            <div class="q-title" onclick="viewQuestion(${q.id})">${escapeHtml(q.title)}</div>
            <div class="q-content">${truncate(escapeHtml(q.content), 220)}</div>

            ${medicalBanner}
        </div>

        <!-- Engagement Bar (Twitter-style) -->
        <div class="q-actions">
            <button onclick="handleDynamicVote(${q.id}, 'QUESTION', 'UPVOTE', this)" class="q-action-btn upvote-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19V5M5 12l7-7 7 7"/></svg>
                <span class="vote-count">${stats.upvotes || 0}</span>
            </button>
            <button onclick="handleDynamicVote(${q.id}, 'QUESTION', 'DOWNVOTE', this)" class="q-action-btn downvote-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
            </button>
            <button onclick="toggleDynamicComments(${q.id}, this)" class="q-action-btn comment-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <span class="q-action-label">${stats.comments || 0}</span>
            </button>
            <button onclick="shareQuestion(${q.id})" class="q-action-btn share-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12v8a2 2 0 002 2h12a2 2 0 002-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
                <span class="q-action-label">Share</span>
            </button>
            <button onclick="handleFollowQuestion(${q.id}, this)" class="q-action-btn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
                <span class="q-action-label">Follow</span>
            </button>
        </div>

        <!-- Comment Section -->
        <div class="q-comment-section" id="comments-${q.id}">
            <div class="q-comment-input-row">
                <input type="text" id="comment-input-${q.id}" class="q-comment-input" placeholder="Write a comment...">
                <button onclick="postDynamicComment(${q.id})" class="q-comment-submit">Post</button>
            </div>
            <div id="comments-list-${q.id}"></div>
        </div>
    </article>`;
}

function renderLoadingState() {
    return `
    <div class="q-loading">
        <div class="q-spinner"></div>
        <p>Loading questions...</p>
    </div>`;
}

function renderEmptyState() {
    return `
    <div class="q-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="40" height="40" style="margin:0 auto;">
            <circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
        </svg>
        <h3>No questions yet</h3>
        <p>Be the first to ask a healthcare question!</p>
    </div>`;
}

function renderLoadMoreButton() {
    if (!hasMore) return '';
    return `
    <div class="q-load-more">
        <button onclick="loadMoreQuestions()" id="load-more-btn">Load More</button>
    </div>`;
}

// ─── Data Loading ─────────────────────────────────────────────────

async function loadQuestions(reset = false) {
    if (isLoading) return;
    isLoading = true;

    const container = document.getElementById('questions-list');
    if (!container) return;

    if (reset) {
        currentPage = 0;
        hasMore = true;
        container.innerHTML = renderLoadingState();
    }

    try {
        let response;
        if (currentCategory) {
            response = await API.qa.getQuestionsByCategory(currentCategory, currentPage, PAGE_SIZE, currentSort);
        } else {
            response = await API.qa.listQuestions(currentPage, PAGE_SIZE, currentSort);
        }

        const data = response.data || response;
        const questions = data.questions || [];
        const pagination = data.pagination || {};

        if (reset) container.innerHTML = '';

        if (questions.length === 0 && currentPage === 0) {
            container.innerHTML = renderEmptyState();
            hasMore = false;
        } else {
            questions.forEach(q => {
                container.insertAdjacentHTML('beforeend', renderQuestionCard(q));
            });
            hasMore = pagination.hasNext !== false && questions.length >= PAGE_SIZE;
        }

        // Remove old load more button and add new one
        const oldBtn = document.getElementById('load-more-btn');
        if (oldBtn) oldBtn.parentElement.remove();
        if (hasMore) container.insertAdjacentHTML('afterend', '');
        // Append load more inside container parent
        const loadMoreContainer = document.getElementById('load-more-container');
        if (loadMoreContainer) loadMoreContainer.remove();
        if (hasMore) {
            container.insertAdjacentHTML('afterend',
                `<div id="load-more-container" class="q-load-more">
                    <button onclick="loadMoreQuestions()">Load More</button>
                </div>`);
        }

    } catch (error) {
        console.error('Failed to load questions:', error);
        if (reset) {
            container.innerHTML = `
            <div class="q-empty">
                <p style="font-weight:600;color:#ef4444;">Failed to load questions</p>
                <p style="font-size:13px;margin-top:6px;">${error.message || 'Please check if the backend is running.'}</p>
                <button onclick="loadQuestions(true)" class="q-comment-submit" style="margin-top:12px;">Retry</button>
            </div>`;
        }
    } finally {
        isLoading = false;
    }
}

function loadMoreQuestions() {
    currentPage++;
    loadQuestions(false);
}

// ─── Dynamic Actions ──────────────────────────────────────────────

async function handleDynamicVote(entityId, votableType, voteType, button) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Please login to vote.');
        return;
    }
    try {
        const res = await API.qa.vote(votableType, entityId, voteType);
        const data = res.data || res;
        // Update vote counts in the card
        const article = button.closest('article');
        const voteButtons = article.querySelectorAll('.vote-count');
        if (voteButtons[0]) voteButtons[0].textContent = data.upvoteCount || 0;
        if (voteButtons[1]) voteButtons[1].textContent = data.downvoteCount || 0;
    } catch (err) {
        console.error('Vote error:', err);
        showToast('Failed to vote', 'error');
    }
}

async function handleFollowQuestion(questionId, button) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Please login to follow questions.');
        return;
    }
    try {
        const res = await API.qa.followQuestion(questionId);
        const data = res.data || res;
        button.textContent = data.isFollowing ? 'Following' : 'Follow';
        button.style.background = data.isFollowing ? '#0d9488' : 'white';
        button.style.color = data.isFollowing ? 'white' : '#0d9488';
    } catch (err) {
        console.error('Follow error:', err);
    }
}

async function toggleDynamicComments(questionId, button) {
    const section = document.getElementById('comments-' + questionId);
    if (!section) return;

    if (section.style.display === 'none') {
        section.style.display = 'block';
        // Load comments from API
        try {
            const res = await API.qa.getComments('QUESTION', String(questionId));
            const comments = (res.data || res) || [];
            const list = document.getElementById('comments-list-' + questionId);
            if (list) {
                list.innerHTML = comments.length > 0
                    ? comments.map(c => renderComment(c)).join('')
                    : '<div style="color:#6b7280;font-size:13px;padding:8px;">No comments yet. Be the first!</div>';
            }
        } catch (err) {
            console.error('Load comments error:', err);
        }
    } else {
        section.style.display = 'none';
    }
}

function renderComment(comment) {
    const author = comment.author || {};
    const initials = author.initials || '?';
    const name = author.username || 'Anonymous';
    const replies = (comment.replies || []).map(r => renderComment(r)).join('');

    return `
    <div style="padding:12px;background:white;border-radius:8px;margin-bottom:8px;">
        <div style="font-weight:600;font-size:14px;margin-bottom:4px;">${escapeHtml(name)}</div>
        <div style="color:#4b5563;font-size:14px;">${escapeHtml(comment.content)}</div>
        <div style="font-size:12px;color:#9ca3af;margin-top:8px;">${comment.timeAgo || ''}</div>
        ${replies ? '<div style="margin-left:16px;margin-top:8px;">' + replies + '</div>' : ''}
    </div>`;
}

async function postDynamicComment(questionId) {
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Please login to comment.');
        return;
    }
    const input = document.getElementById('comment-input-' + questionId);
    if (!input || !input.value.trim()) {
        alert('Please write a comment first.');
        return;
    }
    try {
        await API.qa.createComment('QUESTION', String(questionId), input.value.trim());
        input.value = '';
        showToast('Comment posted!', 'success');
        // Reload comments
        toggleDynamicComments(questionId, null);
        setTimeout(() => { // Re-open
            const section = document.getElementById('comments-' + questionId);
            if (section) section.style.display = 'none';
            toggleDynamicComments(questionId, null);
        }, 100);
    } catch (err) {
        console.error('Post comment error:', err);
        showToast('Failed to post comment', 'error');
    }
}

function viewQuestion(questionId) {
    // Navigate to question detail page (can be built later)
    window.location.href = `questions-feed.html?id=${questionId}`;
}

// ─── Ask Question (dynamic) ──────────────────────────────────────

async function handleAskQuestionDynamic(event) {
    event.preventDefault();
    const user = getCurrentUser();
    if (!user || !user.id) {
        alert('Please login to post a question.');
        return;
    }

    const title = document.getElementById('question-title').value.trim();
    const content = document.getElementById('question-description').value.trim();
    const categorySelect = document.getElementById('question-category');
    const categorySlug = categorySelect ? categorySelect.value : '';

    if (!title) {
        alert('Please enter a question title.');
        return;
    }

    try {
        await API.qa.createQuestion({
            title,
            content: content || title,
            categorySlug
        });
        showToast('Question posted successfully!', 'success');
        closeAskQuestionModal();
        document.getElementById('askQuestionForm').reset();
        loadQuestions(true); // Reload feed
    } catch (err) {
        console.error('Create question error:', err);
        showToast('Failed to post question: ' + (err.message || 'Unknown error'), 'error');
    }
}

// ─── Category Sidebar ─────────────────────────────────────────────

async function loadCategoriesSidebar() {
    try {
        const res = await API.qa.getCategories();
        const categories = (res.data || res) || [];
        // Update the "Ask Question" modal category dropdown
        const select = document.getElementById('question-category');
        if (select && categories.length > 0) {
            select.innerHTML = '<option value="">-- Select a category --</option>';
            categories.forEach(cat => {
                const icon = CATEGORY_COLORS[cat.slug] ? CATEGORY_COLORS[cat.slug].icon : '📋';
                select.innerHTML += `<option value="${cat.slug}">${icon} ${cat.name}</option>`;
            });
        }

        // Update trending topics sidebar
        const trendingContainer = document.getElementById('trending-topics');
        if (trendingContainer && categories.length > 0) {
            trendingContainer.innerHTML = '';
            categories.slice(0, 6).forEach(cat => {
                const catStyle = CATEGORY_COLORS[cat.slug] || { color: '#374151' };
                trendingContainer.innerHTML += `
                <a href="#" onclick="filterByCategory('${cat.slug}'); return false;" style="display:flex;align-items:center;gap:12px;padding:12px;border-radius:8px;cursor:pointer;margin-bottom:8px;color:#4b5563;text-decoration:none;" onmouseover="this.style.background='#f0f0f0'" onmouseout="this.style.background=''">
                    <span style="color:${catStyle.color};font-weight:600;">${cat.name}</span>
                    <span style="margin-left:auto;font-size:12px;color:#6b7280;">${cat.questionCount || 0} questions</span>
                </a>`;
            });
        }
    } catch (err) {
        console.error('Failed to load categories:', err);
    }
}

function filterByCategory(slug) {
    if (currentCategory === slug) {
        currentCategory = null; // Toggle off
    } else {
        currentCategory = slug;
    }
    loadQuestions(true);
}

// ─── Search ───────────────────────────────────────────────────────

function initDynamicSearch() {
    const searchInput = document.querySelector('header input[type="text"]');
    if (!searchInput) return;

    let debounceTimer;
    searchInput.addEventListener('input', function() {
        clearTimeout(debounceTimer);
        const query = this.value.trim();
        debounceTimer = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const res = await API.qa.searchQuestions(query);
                    const data = res.data || res;
                    const container = document.getElementById('questions-list');
                    if (!container) return;
                    container.innerHTML = '';
                    const questions = data.questions || [];
                    if (questions.length === 0) {
                        container.innerHTML = `<div style="text-align:center;padding:40px;color:#6b7280;">No results for "${escapeHtml(query)}"</div>`;
                    } else {
                        questions.forEach(q => container.insertAdjacentHTML('beforeend', renderQuestionCard(q)));
                    }
                } catch (err) {
                    console.error('Search error:', err);
                }
            } else if (query.length === 0) {
                loadQuestions(true);
            }
        }, 400);
    });
}

// ─── Notifications (dynamic) ─────────────────────────────────────

async function loadDynamicNotifications() {
    const user = getCurrentUser();
    if (!user || !user.id) return;

    try {
        const countRes = await API.qa.getUnreadCount();
        const count = (countRes.data || countRes).count || 0;
        const badge = document.getElementById('notification-badge');
        if (badge) badge.style.display = count > 0 ? 'block' : 'none';
    } catch (err) {
        // Notifications are non-critical
    }
}

// ─── Utilities ────────────────────────────────────────────────────

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function truncate(text, maxLen) {
    if (!text || text.length <= maxLen) return text;
    return text.substring(0, maxLen) + '...';
}

// ─── Init ─────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function() {
    // Override the old hardcoded handleAskQuestion with the dynamic version
    const form = document.getElementById('askQuestionForm');
    if (form) {
        form.onsubmit = handleAskQuestionDynamic;
    }

    // Load dynamic data
    loadQuestions(true);
    loadCategoriesSidebar();
    initDynamicSearch();
    loadDynamicNotifications();
});
