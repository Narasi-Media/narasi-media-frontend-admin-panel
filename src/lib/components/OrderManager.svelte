<script>
  import { onMount } from 'svelte';

  let orders = [];
  let loading = true;
  let feedback = '';
  let errorMessage = '';

  // Filter & Search
  let searchQuery = '';
  let statusFilter = 'all';

  // Status Change Modal
  let showStatusModal = false;
  let selectedOrder = null;
  let newStatus = 'processing';
  let remainsCount = 0;
  let startCount = 0;
  let statusReason = '';

  onMount(async () => {
    await loadOrders();
  });

  async function loadOrders() {
    loading = true;
    errorMessage = '';
    try {
      const res = await fetch('/api/admin/orders');
      const json = await res.json();
      if (json.success) {
        orders = json.data || [];
      } else {
        errorMessage = json.message || 'Gagal memuat daftar pesanan.';
      }
    } catch (e) {
      errorMessage = 'Koneksi error: ' + e.message;
    } finally {
      loading = false;
    }
  }

  function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num || 0);
  }

  function formatDate(isoStr) {
    if (!isoStr) return '-';
    const d = new Date(isoStr);
    return d.toLocaleString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function setFeedback(msg) {
    feedback = msg;
    setTimeout(() => (feedback = ''), 4000);
  }

  $: filteredOrders = orders.filter(o => {
    const matchesSearch =
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.target.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.service_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (o.provider_order_id && o.provider_order_id.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  $: totalOrdersCount = orders.length;
  $: processingCount = orders.filter(o => o.status === 'processing' || o.status === 'pending').length;
  $: successCount = orders.filter(o => o.status === 'success').length;
  $: canceledCount = orders.filter(o => o.status === 'canceled').length;

  function openChangeStatusModal(order) {
    selectedOrder = order;
    newStatus = order.status;
    remainsCount = order.remains || 0;
    startCount = order.start_count || 0;
    statusReason = order.error_message || '';
    showStatusModal = true;
  }

  async function handleUpdateStatus() {
    if (!selectedOrder) return;

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: newStatus,
          remains: Number(remainsCount),
          start_count: Number(startCount),
          error_message: statusReason.trim() ? statusReason.trim() : null
        })
      });
      const json = await res.json();
      if (json.success) {
        orders = orders.map(o => (o.id === selectedOrder.id ? json.data : o));
        setFeedback(`Status pesanan #${selectedOrder.id.slice(0, 8)} berhasil diubah menjadi ${newStatus.toUpperCase()}`);
        showStatusModal = false;
      } else {
        alert('Gagal update status: ' + json.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan: ' + e.message);
    }
  }

  function getStatusBadge(status) {
    switch (status) {
      case 'success':
        return { label: 'Selesai', class: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20' };
      case 'processing':
        return { label: 'Diproses', class: 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20' };
      case 'pending':
        return { label: 'Menunggu', class: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20' };
      case 'partial':
        return { label: 'Sebagian (Refund)', class: 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20' };
      case 'canceled':
        return { label: 'Dibatalkan (Refund)', class: 'bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20' };
      default:
        return { label: status, class: 'bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20' };
    }
  }
</script>

<div class="space-y-6">
  <!-- Feedback Notification -->
  {#if feedback}
    <div class="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
      <div class="flex items-center space-x-2 font-medium">
        <span>✓</span>
        <span>{feedback}</span>
      </div>
      <button type="button" on:click={() => (feedback = '')} class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs">✕</button>
    </div>
  {/if}

  {#if errorMessage}
    <div class="p-3.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-400 text-xs flex items-center justify-between">
      <span>{errorMessage}</span>
      <button type="button" on:click={() => (errorMessage = '')} class="text-xs">✕</button>
    </div>
  {/if}

  <!-- Header -->
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <div>
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Manajemen Pesanan Global Client
        </h2>
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        Monitor antrean pesanan masuk, pantau status provider upstream, serta eksekusi override status dan refund otomatis.
      </p>
    </div>

    <button
      type="button"
      on:click={loadOrders}
      class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 text-xs font-medium self-start shadow-sm"
    >
      <span>↻</span>
      <span>Segarkan Data</span>
    </button>
  </div>

  <!-- KPI Badges -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Total Pesanan</div>
      <div class="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">{totalOrdersCount}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Semua riwayat client</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Sedang Berjalan</div>
      <div class="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{processingCount}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Pending / Processing</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Pesanan Selesai</div>
      <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{successCount}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Sukses 100%</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Dibatalkan / Refund</div>
      <div class="text-lg font-bold font-mono text-red-500 mt-1">{canceledCount}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Saldo dikembalikan</div>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="admin-card rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    <div class="relative flex-1 max-w-md">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari ID pesanan, ID layanan, target link, atau ID provider..."
        class="w-full pl-8 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none"
      />
      <span class="absolute left-2.5 top-2 text-zinc-400 text-xs">🔍</span>
    </div>

    <div class="flex items-center space-x-2">
      <select
        bind:value={statusFilter}
        class="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
      >
        <option value="all">Semua Status</option>
        <option value="pending">⏳ Menunggu (Pending)</option>
        <option value="processing">⚙️ Sedang Diproses</option>
        <option value="success">✓ Selesai (Success)</option>
        <option value="partial">✂️ Sebagian (Partial)</option>
        <option value="canceled">✕ Dibatalkan (Canceled)</option>
      </select>
    </div>
  </div>

  <!-- Orders Data Table -->
  <div class="admin-card rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-500">
            <th class="px-4 py-3">Order ID / Tanggal</th>
            <th class="px-4 py-3">Layanan</th>
            <th class="px-4 py-3">Target</th>
            <th class="px-4 py-3 text-right">Kuantitas</th>
            <th class="px-4 py-3 text-right">Total Biaya</th>
            <th class="px-4 py-3 text-center">Status</th>
            <th class="px-4 py-3 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
          {#if loading}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-zinc-400">Memuat pesanan...</td>
            </tr>
          {:else if filteredOrders.length === 0}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-zinc-400">Tidak ada pesanan yang sesuai filter.</td>
            </tr>
          {:else}
            {#each filteredOrders as order}
              {@const badge = getStatusBadge(order.status)}
              <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                <td class="px-4 py-3 align-top whitespace-nowrap">
                  <div class="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-[11px]">
                    #{order.id.slice(0, 8)}...
                  </div>
                  <div class="text-[10px] text-zinc-400 mt-0.5">
                    {formatDate(order.created_at)}
                  </div>
                  {#if order.provider_order_id}
                    <div class="text-[10px] font-mono text-zinc-500 mt-0.5">
                      Prov: {order.provider_order_id}
                    </div>
                  {/if}
                </td>

                <td class="px-4 py-3 align-top">
                  <span class="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                    {order.service_id}
                  </span>
                </td>

                <td class="px-4 py-3 align-top max-w-[200px]">
                  <a
                    href={order.target.startsWith('http') ? order.target : `https://${order.target}`}
                    target="_blank"
                    rel="noreferrer"
                    class="font-mono text-blue-600 dark:text-blue-400 hover:underline truncate block text-xs"
                    title={order.target}
                  >
                    {order.target}
                  </a>
                </td>

                <td class="px-4 py-3 align-top text-right whitespace-nowrap font-mono text-zinc-900 dark:text-zinc-100">
                  {order.quantity.toLocaleString()}
                  {#if order.remains > 0 && order.remains !== order.quantity}
                    <div class="text-[10px] text-zinc-400">Sisa: {order.remains.toLocaleString()}</div>
                  {/if}
                </td>

                <td class="px-4 py-3 align-top text-right whitespace-nowrap font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(order.total_price?.amount || 0)}
                </td>

                <td class="px-4 py-3 align-top text-center whitespace-nowrap">
                  <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border {badge.class}">
                    {badge.label}
                  </span>
                </td>

                <td class="px-4 py-3 align-top text-right whitespace-nowrap">
                  <button
                    type="button"
                    on:click={() => openChangeStatusModal(order)}
                    class="px-2.5 py-1 rounded bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-xs font-medium transition-colors"
                  >
                    Ubah Status
                  </button>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL: Update Order Status -->
  {#if showStatusModal && selectedOrder}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-md w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Ubah Status Pesanan #{selectedOrder.id.slice(0, 8)}
          </h3>
          <button type="button" on:click={() => (showStatusModal = false)} class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm">✕</button>
        </div>

        <div class="space-y-3 text-xs">
          <div>
            <label for="order-status-select" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Status Baru</label>
            <select
              id="order-status-select"
              bind:value={newStatus}
              class="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-medium focus:outline-none"
            >
              <option value="pending">⏳ Pending (Menunggu)</option>
              <option value="processing">⚙️ Processing (Sedang Diproses)</option>
              <option value="success">✓ Success (Selesai Penuh)</option>
              <option value="partial">✂️ Partial (Selesai Sebagian & Refund Sisa)</option>
              <option value="canceled">✕ Canceled (Batalkan & Refund 100%)</option>
            </select>
          </div>

          {#if newStatus === 'partial'}
            <div class="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 space-y-2">
              <div class="font-semibold text-[11px]">Kuantitas Sisa (Remains) untuk Refund:</div>
              <input
                type="number"
                bind:value={remainsCount}
                placeholder="Jumlah kuantitas yang belum terkirim..."
                class="w-full px-2.5 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded text-xs font-mono"
              />
              <div class="text-[10px] text-zinc-500">
                Sistem akan menghitung dan mengkreditkan saldo refund ke user secara atomik.
              </div>
            </div>
          {/if}

          <div>
            <label for="order-reason-input" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Catatan / Alasan (Opsional)</label>
            <input
              id="order-reason-input"
              type="text"
              bind:value={statusReason}
              placeholder="Contoh: Link target diprivate oleh pemilik akun"
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs focus:outline-none"
            />
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            on:click={() => (showStatusModal = false)}
            class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleUpdateStatus}
            class="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-all shadow-sm"
          >
            Simpan Perubahan
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
