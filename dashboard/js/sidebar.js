// Sidebar functionality
function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const toggleArrow = document.getElementById('toggleArrow');
    
    // Check if we should start with sidebar open based on screen size
    if (window.innerWidth < 1024) {
        sidebar.classList.add('closed');
    }
    
    // Set up toggle functionality
    toggleArrow.addEventListener('click', toggleSidebar);
    
    // Also close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
        if (window.innerWidth < 768 && 
            !sidebar.contains(e.target) && 
            e.target !== toggleArrow && 
            !toggleArrow.contains(e.target)) {
            sidebar.classList.add('closed');
            updateToggleArrowIcon();
        }
    });
    
    // Update arrow icon based on sidebar state
    updateToggleArrowIcon();
    
    // Add resize listener to handle responsiveness
    window.addEventListener('resize', handleResize);
    
    function toggleSidebar() {
        sidebar.classList.toggle('closed');
        updateToggleArrowIcon();
    }
    
    function updateToggleArrowIcon() {
        const isClosed = sidebar.classList.contains('closed');
        toggleArrow.innerHTML = isClosed 
            ? '<i class="fa-regular fa-square-caret-right"></i>' 
            : '<i class="fa-regular fa-square-caret-left"></i>';
    }
    
    function handleResize() {
        // Automatically show sidebar on larger screens
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('closed');
        }
        
        updateToggleArrowIcon();
    }
}

export { initSidebar };