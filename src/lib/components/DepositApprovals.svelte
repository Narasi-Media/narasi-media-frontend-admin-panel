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
      user_id: 'hendra_buzzer',
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
      await fetch(`/api/admin/deposits/${depositId}/approve`, { method: 'POST' });
    } catch (e) {
      // offline fallback
    }
    deposits = deposits.filter(d => d.id !== depositId);
    actionFeedback = `✓ Deposit #${depositId} berhasil disetujui! Saldo telah dikreditkan ke user.`;
    setTimeout(() => actionFeedback = '', 4000);
  }

  async function handleReject(depositId) {
    try {
      await fetch(`/api/admin/deposits/${depositId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Bukti transfer tidak valid atau dana belum masuk mutasi' })
      });
    } catch (e) {
      // offline fallback
    }
    deposits = deposits.filter(d => d.id !== depositId);
    actionFeedback = `✕ Deposit #${depositId} telah ditolak.`;
    setTimeout(() => actionFeedback = '', 4000);
  }
</script>

<div class="space-y-6">
  <div class="border-b border-white/5 pb-4 flex items-center justify-between">
    <div>
      <h2 class="text-xl font-bold text-slate-100 flex items-center space-x-2">
        <span class="w-3 h-3 rounded-full bg-amber-400 animate-ping"></span>
        <span>Antrean Verifikasi Deposit Manual QRIS ({deposits.length})</span>
      </h2>
      <p class="text-xs text-slate-400 mt-1">Periksa kesesuaian struk bukti transfer dan mutasi bank, lalu setujui untuk mengisi saldo member.</p>
    </div>
  </div>

  {#if actionFeedback}
    <div class="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold">
      {actionFeedback}
    </div>
  {/if}

  {#if deposits.length === 0}
    <div class="p-12 text-center text-slate-500 admin-card rounded-2xl">
      <svg class="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <div class="font-bold text-sm text-slate-400">Tidak ada deposit yang menunggu verifikasi</div>
      <p class="text-xs mt-1">Semua invoice deposit QRIS telah disetujui atau diproses otomatis.</p>
    </div>
  {:else}
    <div class="overflow-x-auto admin-card rounded-2xl">
      <table class="w-full text-left text-xs text-slate-300 min-w-[800px]">
        <thead class="bg-slate-900/80 text-slate-400 font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
          <tr>
            <th class="py-3 px-4">Invoice / Waktu</th>
            <th class="py-3 px-4">Member</th>
            <th class="py-3 px-4">Nominal Ditagih</th>
            <th class="py-3 px-4">Saldo Dikreditkan</th>
            <th class="py-3 px-4">Pengirim & Struk</th>
            <th class="py-3 px-4 text-center">Aksi Cepat</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-white/5">
          {#each deposits as dep}
            <tr class="hover:bg-white/[0.02] transition-colors">
              <td class="py-3.5 px-4 font-mono">
                <div class="font-bold text-slate-100">#{dep.id}</div>
                <div class="text-[10px] text-slate-500">{dep.created_at}</div>
              </td>
              <td class="py-3.5 px-4 font-medium text-indigo-400">
                @{dep.user_id}
              </td>
              <td class="py-3.5 px-4 font-mono">
                <div class="font-bold text-emerald-400">{formatRupiah(dep.total_to_pay?.amount || 0)}</div>
                <div class="text-[10px] text-amber-400">Kode Unik: {dep.unique_code}</div>
              </td>
              <td class="py-3.5 px-4 font-mono font-bold text-slate-200">
                {formatRupiah(dep.balance_credited?.amount || 0)}
              </td>
              <td class="py-3.5 px-4">
                <div class="font-semibold text-slate-200 truncate max-w-xs">{dep.sender_name}</div>
                <button
                  class="text-[11px] text-indigo-400 hover:text-indigo-300 underline mt-0.5 flex items-center space-x-1"
                  on:click={() => selectedProof = dep.proof_image_url}
                >
                  <span>Lihat Foto Struk / Bukti</span>
                </button>
              </td>
              <td class="py-3.5 px-4 text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    class="py-1.5 px-3 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all"
                    on:click={() => handleApprove(dep.id)}
                  >
                    Setujui (Approve)
                  </button>
                  <button
                    class="py-1.5 px-3 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 transition-all"
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
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" on:click={() => selectedProof = null}>
      <div class="relative max-w-lg w-full bg-slate-900 border border-white/10 rounded-2xl p-4 space-y-3" on:click|stopPropagation>
        <div class="flex items-center justify-between pb-2 border-b border-white/5">
          <span class="text-xs font-bold text-slate-200">Foto Struk Bukti Transfer Member</span>
          <button class="text-slate-400 hover:text-white" on:click={() => selectedProof = null}>✕</button>
        </div>
        <img src={selectedProof} alt="Bukti Transfer" class="w-full max-h-[70vh] object-contain rounded-xl border border-white/10 bg-black/40" />
      </div>
    </div>
  {/if}
</div>
