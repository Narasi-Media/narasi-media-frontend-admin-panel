<script>
  import { onMount } from 'svelte';
  import AdminOverview from './lib/components/AdminOverview.svelte';
  import CategoryManager from './lib/components/CategoryManager.svelte';
  import ServiceManager from './lib/components/ServiceManager.svelte';
  import OrderManager from './lib/components/OrderManager.svelte';
  import DepositApprovals from './lib/components/DepositApprovals.svelte';
  import WebProfileSettings from './lib/components/WebProfileSettings.svelte';

  let currentTab = 'services';
  let selectedCategoryForServices = 'all';
  let providerBalance = 'Rp 1.840.000';
  let todayRevenue = 'Rp 4.750.000';
  let isDark = true;

  // Sidebar Resizable & Collapsible State
  let sidebarWidth = 250;
  let isResizing = false;
  let isCollapsed = false;
  let previousWidth = 250;

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');

    const savedWidth = localStorage.getItem('bm_admin_sidebar_width');
    if (savedWidth) {
      const parsed = parseInt(savedWidth, 10);
      if (parsed >= 180 && parsed <= 450) {
        sidebarWidth = parsed;
        previousWidth = parsed;
      }
    }
  });

  function toggleTheme() {
    isDark = !isDark;
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_admin', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_admin', 'light');
    }
  }

  // Sidebar Resizing Handlers
  function startResizing(e) {
    isResizing = true;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
  }

  function handleMouseMove(e) {
    if (!isResizing) return;
    const newWidth = Math.min(Math.max(e.clientX, 180), 420);
    sidebarWidth = newWidth;
    isCollapsed = false;
  }

  function stopResizing() {
    if (!isResizing) return;
    isResizing = false;
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseup', stopResizing);
    localStorage.setItem('bm_admin_sidebar_width', sidebarWidth.toString());
  }

  function toggleCollapse() {
    if (isCollapsed) {
      sidebarWidth = previousWidth || 250;
      isCollapsed = false;
    } else {
      previousWidth = sidebarWidth;
      sidebarWidth = 64;
      isCollapsed = true;
    }
  }

  // Category to Service navigation
  function handleCategoryNavigate(e) {
    if (e.detail?.tab === 'services') {
      if (e.detail.categoryId) {
        selectedCategoryForServices = e.detail.categoryId;
      }
      currentTab = 'services';
    }
  }

  // Tab Breadcrumb Label Mapping
  function getTabTitle(tab) {
    switch (tab) {
      case 'overview':
        return 'Executive Overview';
      case 'categories':
        return 'Katalog Kategori Layanan';
      case 'services':
        return 'Katalog Layanan & Produk';
      case 'orders':
        return 'Pesanan Pelanggan';
      case 'deposits':
        return 'Verifikasi Deposit QRIS';
      case 'profile':
        return 'Pengaturan Company Profile & Web';
      default:
        return 'Control Center';
    }
  }
</script>

<div class="h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 font-sans overflow-hidden transition-colors duration-150">
  <!-- Top App Header (Linear / Vercel style) -->
  <header class="ui-header h-12 flex-shrink-0 z-30 px-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 transition-colors">
    <!-- Left: Collapse Button & Breadcrumbs -->
    <div class="flex items-center space-x-3">
      <!-- Toggle Collapse Sidebar Button -->
      <button
        type="button"
        on:click={toggleCollapse}
        class="h-7 w-7 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center transition-colors"
        title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
      >
        <svg class="w-3.5 h-3.5 transition-transform {isCollapsed ? 'rotate-180' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="9" y1="3" x2="9" y2="21"></line>
          <path d="M15 9l-3 3 3 3"></path>
        </svg>
      </button>

      <!-- Logo & Breadcrumb -->
      <div class="flex items-center space-x-2 text-xs">
        <div class="w-6 h-6 rounded bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-[11px] shadow-sm">
          NM
        </div>
        <span class="font-semibold text-zinc-900 dark:text-zinc-100">
          narasi.media
        </span>
        <span class="text-zinc-400">/</span>
        <span class="text-zinc-400">admin</span>
        <span class="text-zinc-400">/</span>
        <span class="font-medium text-zinc-800 dark:text-zinc-200">
          {getTabTitle(currentTab)}
        </span>
      </div>
    </div>

    <!-- Right Controls: Provider Balance, Omset, Theme, User Profile -->
    <div class="flex items-center space-x-3 sm:space-x-4 text-xs">
      <div class="text-right hidden sm:block">
        <div class="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">Saldo Provider</div>
        <div class="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-[11px]">{providerBalance}</div>
      </div>
      <div class="text-right hidden sm:block">
        <div class="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">Omset Hari Ini</div>
        <div class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-[11px]">{todayRevenue}</div>
      </div>

      <!-- Theme Switcher Button -->
      <button
        type="button"
        class="h-7 w-7 rounded-lg bg-white dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 transition-all flex items-center justify-center focus:outline-none"
        title={isDark ? 'White Mode' : 'Dark Mode'}
        on:click={toggleTheme}
      >
        {#if isDark}
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="5"></circle>
            <line x1="12" y1="1" x2="12" y2="3"></line>
            <line x1="12" y1="21" x2="12" y2="23"></line>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
            <line x1="1" y1="12" x2="3" y2="12"></line>
            <line x1="21" y1="12" x2="23" y2="12"></line>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
          </svg>
        {:else}
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
          </svg>
        {/if}
      </button>

      <!-- Admin Avatar -->
      <div class="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
        ADM
      </div>
    </div>
  </header>

  <!-- Body Container: Sidebar + Content -->
  <div class="flex-1 flex overflow-hidden relative">
    <!-- RESIZABLE SIDEBAR -->
    <aside
      style="width: {sidebarWidth}px;"
      class="flex-shrink-0 bg-zinc-50/90 dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between select-none relative transition-colors"
    >
      <!-- Navigation Items Container -->
      <div class="p-2.5 space-y-4 overflow-y-auto flex-1">
        <!-- GROUP 1: RINGKASAN & OVERVIEW -->
        <div class="space-y-1">
          {#if !isCollapsed}
            <div class="px-2 text-[10px] font-mono uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              Ringkasan
            </div>
          {/if}
          <button
            type="button"
            on:click={() => currentTab = 'overview'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'space-x-2.5 px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'overview' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Dashboard Overview"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            {#if !isCollapsed}
              <span class="truncate">Dashboard Overview</span>
            {/if}
          </button>
        </div>

        <!-- GROUP 2: KATALOG & PRODUK -->
        <div class="space-y-1">
          {#if !isCollapsed}
            <div class="px-2 text-[10px] font-mono uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              Katalog & Produk
            </div>
          {/if}

          <!-- 1. Katalog Kategori -->
          <button
            type="button"
            on:click={() => currentTab = 'categories'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'categories' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Katalog Kategori Layanan"
          >
            <div class="flex items-center space-x-2.5 truncate">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
              </svg>
              {#if !isCollapsed}
                <span class="truncate">Katalog Kategori</span>
              {/if}
            </div>
            {#if !isCollapsed}
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-700 dark:text-blue-300 font-semibold border border-blue-500/20">
                Kategori
              </span>
            {/if}
          </button>

          <!-- 2. Katalog Layanan -->
          <button
            type="button"
            on:click={() => currentTab = 'services'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'services' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Katalog Layanan & Produk"
          >
            <div class="flex items-center space-x-2.5 truncate">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                <line x1="12" y1="22.08" x2="12" y2="12"></line>
              </svg>
              {#if !isCollapsed}
                <span class="truncate">Katalog Layanan</span>
              {/if}
            </div>
            {#if !isCollapsed}
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-200/60 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-semibold">
                Live
              </span>
            {/if}
          </button>
        </div>

        <!-- GROUP 3: OPERASIONAL & TRANSAKSI -->
        <div class="space-y-1">
          {#if !isCollapsed}
            <div class="px-2 text-[10px] font-mono uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              Operasional
            </div>
          {/if}

          <!-- Verifikasi Deposit QRIS -->
          <button
            type="button"
            on:click={() => currentTab = 'deposits'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'deposits' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Verifikasi Deposit QRIS"
          >
            <div class="flex items-center space-x-2.5 truncate">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              {#if !isCollapsed}
                <span class="truncate">Verifikasi QRIS</span>
              {/if}
            </div>
            {#if !isCollapsed}
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/30">
                2
              </span>
            {/if}
          </button>

          <!-- Pesanan Pelanggan -->
          <button
            type="button"
            on:click={() => currentTab = 'orders'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'justify-between px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'orders' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Pesanan Pelanggan"
          >
            <div class="flex items-center space-x-2.5 truncate">
              <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              {#if !isCollapsed}
                <span class="truncate">Pesanan Pelanggan</span>
              {/if}
            </div>
            {#if !isCollapsed}
              <span class="text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-700 dark:text-blue-300 font-medium">
                Aktif
              </span>
            {/if}
          </button>
        </div>

        <!-- GROUP 4: SISTEM & WEB -->
        <div class="space-y-1">
          {#if !isCollapsed}
            <div class="px-2 text-[10px] font-mono uppercase font-semibold text-zinc-400 dark:text-zinc-500 tracking-wider">
              Sistem & Web
            </div>
          {/if}
          <button
            type="button"
            on:click={() => currentTab = 'profile'}
            class="w-full flex items-center {isCollapsed ? 'justify-center px-1' : 'space-x-2.5 px-2.5'} py-1.5 rounded-lg text-xs font-medium transition-all {currentTab === 'profile' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'}"
            title="Company Profile & Web Settings"
          >
            <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="2" y1="12" x2="22" y2="12"></line>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
            </svg>
            {#if !isCollapsed}
              <span class="truncate">Company Profile</span>
            {/if}
          </button>
        </div>
      </div>

      <!-- Bottom Sidebar Footer: Server Health & Width Indicator -->
      <div class="p-3 border-t border-zinc-200 dark:border-zinc-800 text-[10px] text-zinc-400 font-mono flex items-center justify-between">
        {#if !isCollapsed}
          <div class="flex items-center space-x-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <span>Sistem Normal</span>
          </div>
          <span class="text-[9px] text-zinc-400" title="Geser garis tepi kanan untuk ubah lebar">
            {sidebarWidth}px
          </span>
        {:else}
          <div class="w-full flex justify-center">
            <span class="w-2 h-2 rounded-full bg-emerald-500" title="Sistem Normal"></span>
          </div>
        {/if}
      </div>

      <!-- INTERACTIVE RESIZER HANDLE (Right Border Drag Zone) -->
      <button
        type="button"
        aria-label="Atur lebar sidebar"
        on:mousedown={startResizing}
        class="absolute -right-1 top-0 bottom-0 w-2.5 cursor-col-resize z-20 group flex items-center justify-center hover:bg-blue-500/20 active:bg-blue-500/30 transition-colors focus:outline-none"
        title="Tarik untuk atur lebar sidebar secara fleksibel"
      >
        <div class="w-[1.5px] h-full bg-transparent group-hover:bg-blue-500 group-active:bg-blue-500 transition-colors pointer-events-none"></div>
      </button>
    </aside>

    <!-- MAIN SCROLLABLE CONTENT VIEW -->
    <main class="flex-1 overflow-y-auto px-6 lg:px-8 py-6">
      <div class="max-w-7xl mx-auto">
        {#if currentTab === 'overview'}
          <AdminOverview on:navigate={(e) => currentTab = e.detail} {providerBalance} {todayRevenue} />
        {:else if currentTab === 'categories'}
          <CategoryManager on:navigate={handleCategoryNavigate} />
        {:else if currentTab === 'services'}
          <ServiceManager selectedCategoryFilter={selectedCategoryForServices} />
        {:else if currentTab === 'orders'}
          <OrderManager />
        {:else if currentTab === 'deposits'}
          <DepositApprovals />
        {:else if currentTab === 'profile'}
          <WebProfileSettings />
        {/if}
      </div>
    </main>
  </div>
</div>
