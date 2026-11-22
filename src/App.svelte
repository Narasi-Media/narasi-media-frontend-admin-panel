<script>
  import DepositApprovals from './lib/components/DepositApprovals.svelte';

  let currentTab = 'deposits';
  let providerBalance = 'Rp 1.840.000';
  let todayRevenue = 'Rp 4.750.000';
</script>

<div class="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
  <!-- Admin Header -->
  <header class="bg-slate-900/90 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md px-6 py-4">
    <div class="max-w-7xl mx-auto flex items-center justify-between">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
          BM
        </div>
        <div>
          <div class="flex items-center space-x-2">
            <span class="text-lg font-bold text-slate-100">Buzzer Media <span class="text-amber-400">Admin Control</span></span>
            <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              STAFF PANEL
            </span>
          </div>
          <div class="text-[11px] text-slate-400">Sistem Manajemen & Keuangan QRIS</div>
        </div>
      </div>

      <!-- Live Provider Status -->
      <div class="flex items-center space-x-6 text-xs">
        <div class="text-right hidden sm:block">
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Saldo Provider SMM:</div>
          <div class="font-bold text-emerald-400 font-mono">{providerBalance}</div>
        </div>
        <div class="text-right hidden sm:block">
          <div class="text-[10px] text-slate-500 uppercase font-semibold">Omset Hari Ini:</div>
          <div class="font-bold text-indigo-400 font-mono">{todayRevenue}</div>
        </div>
        <div class="w-8 h-8 rounded-full bg-slate-800 border border-white/10 flex items-center justify-center font-bold text-xs text-amber-400">
          ADM
        </div>
      </div>
    </div>
  </header>

  <!-- Navigation Bar -->
  <div class="bg-slate-900/60 border-b border-white/5 px-6">
    <div class="max-w-7xl mx-auto flex space-x-2 py-2">
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all {currentTab === 'deposits' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => currentTab = 'deposits'}
      >
        Verifikasi Deposit QRIS (2)
      </button>
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all {currentTab === 'orders' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => currentTab = 'orders'}
      >
        Semua Pesanan Client
      </button>
      <button
        class="px-4 py-2 rounded-xl text-xs font-bold transition-all {currentTab === 'services' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}"
        on:click={() => currentTab = 'services'}
      >
        Markup Harga & Provider API
      </button>
    </div>
  </div>

  <!-- Main Content -->
  <main class="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
    {#if currentTab === 'deposits'}
      <DepositApprovals />
    {:else if currentTab === 'orders'}
      <div class="admin-card rounded-2xl p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-100">Manajemen Pesanan Global</h3>
        <p class="text-xs text-slate-400">Seluruh pesanan yang masuk dari member client akan diteruskan ke provider upstream SMM v2 secara otomatis.</p>
        <div class="p-6 text-center text-slate-500 text-xs font-mono">
          Semua antrean sinkronisasi status aktif berjalan via cron setiap 2 menit.
        </div>
      </div>
    {:else if currentTab === 'services'}
      <div class="admin-card rounded-2xl p-6 space-y-4">
        <h3 class="text-lg font-bold text-slate-100">Pengaturan Markup Margin Keuntungan</h3>
        <p class="text-xs text-slate-400">Atur persentase keuntungan penjualan layanan dari harga modal provider SMM.</p>
        <div class="max-w-xs space-y-2">
          <label class="block text-xs font-bold text-slate-300">Global Profit Markup (%)</label>
          <div class="flex items-center space-x-2">
            <input type="number" value="25" class="bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono font-bold w-24" />
            <span class="text-xs text-slate-400">% Tambahan dari harga modal</span>
          </div>
          <button class="py-2 px-4 rounded-xl bg-indigo-600 text-white text-xs font-bold mt-2 hover:bg-indigo-500 transition-all">
            Simpan Perubahan
          </button>
        </div>
      </div>
    {/if}
  </main>
</div>
