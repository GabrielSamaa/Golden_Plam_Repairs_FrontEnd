<template>
    <div class="default-layout">
        <slot />
    </div>
</template>

<style scoped>
.default-layout {
    min-height: 100vh;
    position: relative;
}

.theme-toggle {
    position: fixed;
    top: 20px;
    left: 20px;
    z-index: 1000;
    background-color: var(--bg-secondary);
    border: none;
    padding: 10px;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--text-primary);
    transition: all 0.3s;
    box-shadow: 0 2px 8px var(--shadow-color);
}

.theme-toggle:hover {
    transform: scale(1.1);
    background-color: var(--hover-bg);
}

.theme-toggle i {
    font-size: 1.2rem;
}

@media (max-width: 768px) {
    .theme-toggle {
        top: 10px;
        left: 10px;
        padding: 8px;
    }
    
    .theme-toggle i {
        font-size: 1rem;
    }
}
</style>

