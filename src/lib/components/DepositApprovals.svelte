<script>
  import { onMount } from 'svelte';

  let deposits = [
    {
      id: 'DEP-802914',
      created_at: '2026-11-22 07:50:22',
      user_id: 'regiami',
      method: 'manual_qris',
      requested_amount: { amount: 50000 },
      unique_code: 387,
      total_to_pay: { amount: 50387 },
      balance_credited: { amount: 52500 },
      sender_name: 'Budi Santoso (BCA Transfer)',
      proof_image_url: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&q=80',
      status: 'waiting_verification'
    },
    {
      id: 'DEP-802910',
      created_at: '2026-11-22 07:15:00',
      user_id: 'hendra_narasi',
      method: 'manual_qris',
      requested_amount: { amount: 100000 },
      unique_code: 215,
      total_to_pay: { amount: 100215 },
      balance_credited: { amount: 105000 },
      sender_name: 'Hendra Setiawan (GoPay QRIS)',
      proof_image_url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400&q=80',
      status: 'waiting_verification'
    }
  ];

  let selectedProof = null;
  let actionFeedback = '';

  function formatRupiah(num) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
  }

  async function handleApprove(depositId) {
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/approve`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || `HTTP ${res.status}: Gagal memproses persetujuan`);
      }
      deposits = deposits.filter(d => d.id !== depositId);
      actionFeedback = `Deposit #${depositId} berhasil disetujui. Saldo telah dikreditkan ke user.`;
    } catch (e) {
      actionFeedback = `Gagal menyetujui deposit #${depositId}: ${e.message}`;
    }
    setTimeout(() => actionFeedback = '', 4000);
  }

  async function handleReject(depositId) {
    try {
      const res = await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Bukti transfer tidak valid atau dana belum masuk mutasi' })
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        throw new Error(json.message || json.error || `HTTP ${res.status}: Gagal memproses penolakan`);
      }
      deposits = deposits.filter(d => d.id !== depositId);
      actionFeedback = `Deposit #${depositId} telah ditolak.`;
    } catch (e) {
      actionFeedback = `Gagal menolak deposit #${depositId}: ${e.message}`;
    }
    setTimeout(() => actionFeedback = '', 4000);
  }
</script>

<div class="space-y-4">
  <div class="border-b border-zinc-200 dark:border-zinc-800 pb-3 flex items-center justify-between">
    <div>
      <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
        <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
        <span>Antrean Verifikasi Deposit QRIS ({deposits.length})</span>
      </h2>
      <p class="text-[11px] text-zinc-500 mt-0.5">Periksa bukti struk dan nominal 3 digit terakhir, lalu setujui untuk mengisi saldo akun klien.</p>
    </div>
  </div>

  {#if actionFeedback}
    <div class="p-3 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-medium flex items-center justify-between shadow-sm">
      <span>{actionFeedback}</span>
    </div>
  {/if}

  {#if deposits.length === 0}
    <div class="p-10 text-center text-zinc-400 admin-card rounded-xl">
      <div class="font-medium text-xs text-zinc-600 dark:text-zinc-400">Tidak ada antrean deposit yang pending</div>
      <p class="text-[11px] mt-0.5">Semua invoice deposit manual QRIS telah disetujui.</p>
    </div>
  {:else}
    <div class="overflow-x-auto admin-card rounded-xl">
      <table class="w-full text-left text-xs text-zinc-600 dark:text-zinc-300 min-w-[780px]">
        <thead class="bg-zinc-50 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 font-medium border-b border-zinc-200 dark:border-zinc-800 text-[11px]">
          <tr>
            <th class="py-2.5 px-4">Invoice & Waktu</th>
            <th class="py-2.5 px-4">Member</th>
            <th class="py-2.5 px-4">Nominal Tagihan</th>
            <th class="py-2.5 px-4">Saldo Masuk</th>
            <th class="py-2.5 px-4">Pengirim & Struk</th>
            <th class="py-2.5 px-4 text-center">Aksi Verifikasi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800/80">
          {#each deposits as dep}
            {@const isDemo = dep.id.startsWith('DEMO') || dep.user_id === 'regiami' || (dep.status && dep.status.includes('Demo')) || (dep.sender_name && dep.sender_name.includes('[DEMO]'))}
            <tr class="hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors">
              <td class="py-3 px-4 font-mono">
                <div class="flex items-center space-x-1.5">
                  <span class="font-medium text-zinc-900 dark:text-zinc-100">#{dep.id}</span>
                  {#if isDemo}
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30">
                      ⚡ DEMO
                    </span>
                  {/if}
                </div>
                <div class="text-[10px] text-zinc-400">{dep.created_at}</div>
              </td>
              <td class="py-3 px-4 font-mono text-zinc-900 dark:text-zinc-200">
                <div class="flex items-center space-x-1">
                  <span>@{dep.user_id}</span>
                  {#if isDemo}
                    <span class="text-[8px] font-bold text-amber-600 dark:text-amber-400">(Demo)</span>
                  {/if}
                </div>
              </td>
              <td class="py-3 px-4 font-mono">
                <div class="font-semibold text-zinc-900 dark:text-zinc-100">{formatRupiah(dep.total_to_pay?.amount || 0)}</div>
                <div class="text-[10px] text-zinc-500">Kode Unik: {dep.unique_code}</div>
              </td>
              <td class="py-3 px-4 font-mono font-medium text-emerald-600 dark:text-emerald-400">
                {formatRupiah(dep.balance_credited?.amount || 0)}
              </td>
              <td class="py-3 px-4">
                <div class="font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">{dep.sender_name}</div>
                <button
                  type="button"
                  class="text-[11px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 underline mt-0.5 flex items-center space-x-1"
                  on:click={() => selectedProof = dep.proof_image_url}
                >
                  <span>Lihat Foto Struk</span>
                </button>
              </td>
              <td class="py-3 px-4 text-center">
                <div class="flex items-center justify-center space-x-1.5">
                  <button
                    type="button"
                    class="h-7 px-3 rounded text-xs font-medium bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all shadow-sm"
                    on:click={() => handleApprove(dep.id)}
                  >
                    Setujui
                  </button>
                  <button
                    type="button"
                    class="h-7 px-3 rounded text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-all"
                    on:click={() => handleReject(dep.id)}
                  >
                    Tolak
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}

  <!-- Lightbox Modal Bukti Transfer -->
  {#if selectedProof}
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
      on:click={() => selectedProof = null}
      on:keydown={(e) => e.key === 'Escape' && (selectedProof = null)}
    >
      <div
        role="document"
        class="relative max-w-sm w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 space-y-3 shadow-2xl"
        on:click|stopPropagation
        on:keydown|stopPropagation
      >
        <div class="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800 text-xs">
          <span class="font-medium text-zinc-900 dark:text-zinc-100">Struk Pembayaran Member</span>
          <button type="button" class="text-zinc-400 hover:text-zinc-600 dark:hover:text-white" on:click={() => selectedProof = null}>✕</button>
        </div>
        <img src={selectedProof} alt="Bukti Transfer" class="w-full max-h-[60vh] object-contain rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black/40" />
      </div>
    </div>
  {/if}
</div>
