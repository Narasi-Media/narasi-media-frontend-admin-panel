<script>
  import { onMount } from 'svelte';
  import DepositApprovals from './lib/components/DepositApprovals.svelte';

  let currentTab = 'deposits';
  let providerBalance = 'Rp 1.840.000';
  let todayRevenue = 'Rp 4.750.000';
  let isDark = true;

  onMount(() => {
    isDark = document.documentElement.classList.contains('dark');
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
</script>

<div class="min-h-screen bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex flex-col font-sans transition-colors duration-150">
  <!-- Admin Header (Linear style) -->
  <header class="ui-header sticky top-0 z-40 px-6 py-3 transition-colors">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center font-mono font-bold text-xs shadow-sm">
          BM
        </div>
        <div class="flex items-center space-x-2">
          <span class="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">
            buzzer.media <span class="text-zinc-400 font-normal">/ admin</span>
          </span>
          <span class="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
            Control Center
          </span>
        </div>
      </div>

      <!-- Live Provider Status & Controls -->
      <div class="flex items-center space-x-4 sm:space-x-5 text-xs">
        <div class="text-right hidden sm:block">
          <div class="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">Saldo Provider</div>
          <div class="font-bold text-zinc-900 dark:text-zinc-100 font-mono text-xs">{providerBalance}</div>
        </div>
        <div class="text-right hidden sm:block">
          <div class="text-[9px] text-zinc-400 uppercase tracking-wider font-semibold font-mono">Omset Hari Ini</div>
          <div class="font-bold text-emerald-600 dark:text-emerald-400 font-mono text-xs">{todayRevenue}</div>
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

        <div class="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
          ADM
        </div>
      </div>
    </div>
  </header>

  <!-- Segmented Navigation Bar -->
  <div class="bg-zinc-50 dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 px-6 py-2 transition-colors">
    <div class="max-w-7xl mx-auto flex space-x-1">
      <button
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {currentTab === 'deposits' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}"
        on:click={() => currentTab = 'deposits'}
      >
        Verifikasi Deposit QRIS (2)
      </button>
      <button
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {currentTab === 'orders' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}"
        on:click={() => currentTab = 'orders'}
      >
        Pesanan Client
      </button>
      <button
        type="button"
        class="px-3 py-1.5 rounded-md text-xs font-medium transition-all {currentTab === 'services' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold shadow-sm' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}"
        on:click={() => currentTab = 'services'}
      >
        Markup Margin & Provider
      </button>
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
    {#if currentTab === 'deposits'}
      <DepositApprovals />
    {:else if currentTab === 'orders'}
      <div class="admin-card rounded-xl p-6 space-y-3">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Manajemen Pesanan Global</h3>
        <p class="text-xs text-zinc-500 leading-relaxed">Seluruh pesanan yang masuk dari member client akan diteruskan ke provider upstream SMM v2 secara otomatis.</p>
        <div class="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg text-center text-zinc-400 text-xs font-mono border border-zinc-200 dark:border-zinc-800">
          Antrean sinkronisasi status aktif berjalan via cron daemon setiap 2 menit.
        </div>
      </div>
    {:else if currentTab === 'services'}
      <div class="admin-card rounded-xl p-6 space-y-4">
        <h3 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Pengaturan Markup Margin Keuntungan</h3>
        <p class="text-xs text-zinc-500 leading-relaxed">Atur persentase keuntungan penjualan layanan dari harga modal provider SMM.</p>
        <div class="max-w-xs space-y-2">
          <label for="markup-input" class="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Global Profit Markup (%)</label>
          <div class="flex items-center space-x-2">
            <input id="markup-input" type="number" value="25" class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg px-3 py-1.5 text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold w-20 focus:outline-none focus:border-zinc-500" />
            <span class="text-xs text-zinc-500">% Tambahan dari harga modal</span>
          </div>
          <button type="button" class="h-8 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-medium mt-2 transition-all shadow-sm">
            Simpan Perubahan
          </button>
        </div>
      </div>
    {/if}
  </main>
</div>
