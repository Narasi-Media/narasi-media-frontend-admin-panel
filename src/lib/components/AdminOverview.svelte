<script>
  import { createEventDispatcher, onMount } from 'svelte';

  const dispatch = createEventDispatcher();

  export let providerBalance = 'Rp 1.840.000';
  export let todayRevenue = 'Rp 4.750.000';

  let totalServices = 4;
  let pendingDeposits = 2;
  let processingOrders = 1;
  let recentOrders = [];

  onMount(async () => {
    try {
      const [srvRes, ordRes] = await Promise.all([
        fetch('/api/services').then(r => r.json()),
        fetch('/api/admin/orders').then(r => r.json())
      ]);
      if (srvRes.success) totalServices = srvRes.data?.length || 4;
      if (ordRes.success) {
        const allOrders = ordRes.data || [];
        recentOrders = allOrders.slice(0, 5);
        processingOrders = allOrders.filter(o => o.status === 'processing' || o.status === 'pending').length;
      }
    } catch (e) {
      // fallback
    }
  });

  function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  }

  function navigateTo(tab) {
    dispatch('navigate', tab);
  }
</script>

<div class="space-y-6">
  <!-- Header Title -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Executive Overview & Control Dashboard
        </h2>
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        Ringkasan performa real-time, status keuangan provider, antrean verifikasi manual, dan metrik operasional.
      </p>
    </div>

    <!-- Quick Status Badge -->
    <div class="inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-medium self-start">
      <span>●</span>
      <span>Upstream SMM v2 Connected (42ms)</span>
    </div>
  </div>

  <!-- KPI Cards (High density, Linear / Shadcn aesthetic) -->
  <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    <!-- Saldo Provider -->
    <div class="admin-card rounded-xl p-4 space-y-2">
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span class="font-mono text-[10px] uppercase tracking-wider font-semibold">Saldo Provider</span>
        <span class="text-xs">⚡</span>
      </div>
      <div class="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
        {providerBalance}
      </div>
      <div class="text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Sisa limit upstream</span>
        <span class="text-emerald-600 dark:text-emerald-400 font-medium">Aman</span>
      </div>
    </div>

    <!-- Omset Hari Ini -->
    <div class="admin-card rounded-xl p-4 space-y-2">
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span class="font-mono text-[10px] uppercase tracking-wider font-semibold">Omset Hari Ini</span>
        <span class="text-xs">📈</span>
      </div>
      <div class="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">
        {todayRevenue}
      </div>
      <div class="text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Estimasi Margin Bersih</span>
        <span class="font-mono font-semibold text-zinc-800 dark:text-zinc-200">+Rp 1.187.500</span>
      </div>
    </div>

    <!-- Antrean Deposit QRIS -->
    <button
      type="button"
      on:click={() => navigateTo('deposits')}
      class="admin-card rounded-xl p-4 space-y-2 text-left hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group"
    >
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span class="font-mono text-[10px] uppercase tracking-wider font-semibold">Verifikasi Deposit</span>
        <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400">
          2 Pending
        </span>
      </div>
      <div class="text-xl font-bold font-mono text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform">
        {pendingDeposits} Menunggu
      </div>
      <div class="text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Perlu ditinjau admin</span>
        <span class="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Buka →</span>
      </div>
    </button>

    <!-- Pesanan Berjalan -->
    <button
      type="button"
      on:click={() => navigateTo('orders')}
      class="admin-card rounded-xl p-4 space-y-2 text-left hover:border-zinc-400 dark:hover:border-zinc-700 transition-all group"
    >
      <div class="flex items-center justify-between text-xs text-zinc-500">
        <span class="font-mono text-[10px] uppercase tracking-wider font-semibold">Pesanan Aktif</span>
        <span class="text-xs">🔄</span>
      </div>
      <div class="text-xl font-bold font-mono text-blue-600 dark:text-blue-400 group-hover:translate-x-0.5 transition-transform">
        {processingOrders} Pesanan
      </div>
      <div class="text-[11px] text-zinc-500 flex items-center justify-between">
        <span>Dalam antrean sinkron</span>
        <span class="text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Buka →</span>
      </div>
    </button>
  </div>

  <!-- Quick Shortcut Cards (Grid 3 Column) -->
  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
    <!-- CRUD Katalog Layanan -->
    <div class="admin-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">
          📦
        </div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Katalog & Produk Layanan</h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Tambah layanan baru, duplikasi produk, atur harga modal dan jual, atau atur margin keuntungan secara massal.
        </p>
      </div>
      <button
        type="button"
        on:click={() => navigateTo('services')}
        class="w-full py-2 px-3 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 text-xs font-semibold shadow-sm transition-all text-center mt-2"
      >
        Kelola Katalog Layanan ({totalServices}) →
      </button>
    </div>

    <!-- Verifikasi QRIS Manual -->
    <div class="admin-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">
          💳
        </div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Verifikasi Deposit QRIS</h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Tinjau bukti transfer m-Banking / QRIS pengguna dengan lightbox screenshot dan 1-click approve.
        </p>
      </div>
      <button
        type="button"
        on:click={() => navigateTo('deposits')}
        class="w-full py-2 px-3 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all text-center mt-2"
      >
        Tinjau 2 Antrean Deposit →
      </button>
    </div>

    <!-- Company Profile & Web Settings -->
    <div class="admin-card rounded-xl p-5 space-y-3 flex flex-col justify-between">
      <div class="space-y-1.5">
        <div class="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs">
          🌐
        </div>
        <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Company Profile & Landing Page</h3>
        <p class="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
          Kelola profil legalitas PT Buzzer Media Solusindo, nomor kontak WhatsApp CS 24 Jam, dan promo banner.
        </p>
      </div>
      <button
        type="button"
        on:click={() => navigateTo('profile')}
        class="w-full py-2 px-3 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-semibold shadow-sm transition-all text-center mt-2"
      >
        Atur Profil Website →
      </button>
    </div>
  </div>

  <!-- Recent Orders Table Preview -->
  <div class="admin-card rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-3 p-5">
    <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
      <div>
        <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
          Pesanan Client Terbaru
        </h3>
        <p class="text-[11px] text-zinc-500">Aktivitas pesanan member client terkini</p>
      </div>
      <button
        type="button"
        on:click={() => navigateTo('orders')}
        class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
        Lihat Semua Pesanan →
      </button>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead>
          <tr class="text-[10px] font-mono uppercase text-zinc-400 border-b border-zinc-100 dark:border-zinc-800 pb-2">
            <th class="py-2">Order ID</th>
            <th class="py-2">Layanan</th>
            <th class="py-2">Target</th>
            <th class="py-2 text-right">Kuantitas</th>
            <th class="py-2 text-right">Total</th>
            <th class="py-2 text-center">Status</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-mono text-[11px]">
          {#each recentOrders as ord}
            <tr class="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
              <td class="py-2.5 font-bold text-zinc-800 dark:text-zinc-200">#{ord.id.slice(0, 8)}</td>
              <td class="py-2.5 text-zinc-600 dark:text-zinc-400">{ord.service_id}</td>
              <td class="py-2.5 text-zinc-600 dark:text-zinc-400 truncate max-w-[180px]">{ord.target}</td>
              <td class="py-2.5 text-right text-zinc-900 dark:text-zinc-100">{ord.quantity.toLocaleString()}</td>
              <td class="py-2.5 text-right font-bold text-zinc-900 dark:text-zinc-100">{formatRupiah(ord.total_price?.amount || 0)}</td>
              <td class="py-2.5 text-center">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-medium {ord.status === 'success' ? 'bg-emerald-500/10 text-emerald-600' : 'bg-blue-500/10 text-blue-600'}">
                  {ord.status}
                </span>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>
</div>
