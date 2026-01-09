// DOM Elements
const upvoteButtons = document.querySelectorAll('.action-btn.upvote');
const followButton = document.querySelector('.btn-follow');
const addQuestionBtn = document.querySelector('.btn-primary');
const searchInput = document.querySelector('.search-input');
const sidebarItems = document.querySelectorAll('.sidebar-item');
const navLinks = document.querySelectorAll('.nav-link');

// Upvote functionality
upvoteButtons.forEach(button => {
    let isUpvoted = false;
    
    button.addEventListener('click', function() {
        const upvoteText = this.querySelector('span:last-child');
        const currentCount = parseInt(upvoteText.textContent.split('•')[1].trim());
        
        if (isUpvoted) {
            upvoteText.textContent = `Upvote • ${currentCount - 1}`;
            this.style.backgroundColor = '';
            this.style.borderColor = '#ddd';
            this.style.color = '';
        } else {
            upvoteText.textContent = `Upvote • ${currentCount + 1}`;
            this.style.backgroundColor = '#e3f2fd';
            this.style.borderColor = '#3498db';
            this.style.color = '#3498db';
        }
        
        isUpvoted = !isUpvoted;
    });
});

// Follow button functionality
if (followButton) {
    let isFollowing = false;
    
    followButton.addEventListener('click', function() {
        if (isFollowing) {
            this.textContent = 'Follow';
            this.style.backgroundColor = 'transparent';
            this.style.color = '#3498db';
        } else {
            this.textContent = 'Following';
            this.style.backgroundColor = '#3498db';
            this.style.color = 'white';
        }
        
        isFollowing = !isFollowing;
    });
}

// Add Question button
if (addQuestionBtn) {
    addQuestionBtn.addEventListener('click', function() {
        alert('Add Question feature will be implemented on the backend.');
    });
}

// Search functionality
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        console.log('Searching for:', searchTerm);
        // This will be connected to backend search API
    });
    
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const searchTerm = this.value;
            console.log('Search submitted:', searchTerm);
            // This will trigger backend search
        }
    });
}

// Sidebar navigation
sidebarItems.forEach(item => {
    item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Remove active class from all items
        sidebarItems.forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        const category = this.textContent.trim();
        console.log('Selected category:', category);
        // This will filter posts by category via backend
    });
});

// Navigation links
navLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
    });
});

// Report button functionality
const reportButtons = document.querySelectorAll('.report-btn');
reportButtons.forEach(button => {
    button.addEventListener('click', function() {
        if (confirm('Are you sure you want to report this content?')) {
            alert('Report submitted. Our team will review this content.');
            // This will send report to backend
        }
    });
});

// Talk to Doctor button
const talkToDoctorBtn = document.querySelector('.btn-urgent');
if (talkToDoctorBtn) {
    talkToDoctorBtn.addEventListener('click', function() {
        alert('Connecting you with available doctors...');
        // This will redirect to doctor consultation page
    });
}

// Comment button functionality
const commentButtons = document.querySelectorAll('.action-btn');
commentButtons.forEach(button => {
    if (button.textContent.includes('💬')) {
        button.addEventListener('click', function() {
            console.log('Opening comments section');
            // This will expand comments section
        });
    }
});

// Share button functionality
commentButtons.forEach(button => {
    if (button.textContent.includes('🔗')) {
        button.addEventListener('click', function() {
            const postTitle = this.closest('.post').querySelector('.post-title').textContent;
            const dummyUrl = 'https://agocare.ug/post/123';
            
            if (navigator.clipboard) {
                navigator.clipboard.writeText(dummyUrl).then(() => {
                    alert('Link copied to clipboard!');
                });
            } else {
                alert('Share link: ' + dummyUrl);
            }
        });
    }
});

// Trending items click
const trendingLinks = document.querySelectorAll('.trending-link');
trendingLinks.forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const topic = this.textContent;
        console.log('Viewing trending topic:', topic);
        // This will load posts related to the trending topic
    });
});

// User avatar click
const avatar = document.querySelector('.avatar');
if (avatar) {
    avatar.addEventListener('click', function() {
        console.log('Opening user profile');
        // This will redirect to user profile page
    });
}

// Smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Agocare Digital Health Platform loaded');
    
    // Add loading animation class to posts
    const posts = document.querySelectorAll('.post');
    posts.forEach((post, index) => {
        post.style.opacity = '0';
        post.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            post.style.transition = 'opacity 0.5s, transform 0.5s';
            post.style.opacity = '1';
            post.style.transform = 'translateY(0)';
        }, index * 100);
    });
});