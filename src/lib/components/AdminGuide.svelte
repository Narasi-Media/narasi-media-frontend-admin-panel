<script>
  import { createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let searchQuery = '';
  let activeCategory = 'all';

  const sops = [
    {
      id: 'deposit-sop',
      category: 'deposits',
      badge: 'Finansial & Kasir',
      title: 'SOP Verifikasi Deposit QRIS Manual & Kode Unik',
      summary: 'Prosedur validasi mutasi rekening/e-wallet sebelum melakukan persetujuan (Approve) deposit saldo pelanggan.',
      steps: [
        'Buka menu "Verifikasi Deposit QRIS" dari sidebar.',
        'Periksa daftar deposit berstatus "Pending" berwarna kuning.',
        'Perhatikan "Kode Unik 3 Digit" (contoh: Rp 50.814). Kode unik ini memudahkan rekonsiliasi manual mutasi bank.',
        'Klik tombol "Lihat Bukti" untuk memeriksa foto/screenshot resi transfer yang diunggah pelanggan.',
        'Cocokkan tanggal, jam, dan nominal pasti pada mutasi QRIS / rekening operasional Narasi Media.',
        'Klik tombol centang hijau "Setujui" jika valid. Saldo user seketika bertambah otomatis.',
        'Jika mutasi tidak ditemukan atau resi palsu, klik tombol silang merah "Tolak" dan cantumkan alasan.'
      ],
      tip: 'Deposit dari akun demo (@regiami) otomatis berlabel [DEMO]. Penyetujuan deposit demo tidak memengaruhi pembukuan kas riil.',
      targetTab: 'deposits'
    },
    {
      id: 'catalog-sop',
      category: 'services',
      badge: 'Katalog & Pricing',
      title: 'SOP Manajemen Layanan & Markup Margin Harga',
      summary: 'Cara mengatur harga jual, margin keuntungan, dan status aktif/nonaktif layanan media sosial.',
      steps: [
        'Buka menu "Katalog Layanan" di sidebar.',
        'Gunakan filter Kategori (Instagram, TikTok, YouTube, dll) untuk memfokuskan daftar.',
        'Perhatikan kolom "Harga Modal" (dari provider) dan "Harga Jual" (ke pelanggan).',
        'Klik "Edit Layanan" untuk mengubah margin keuntungan secara persentase (%) atau nominal flat (Rp).',
        'Jika provider pusat sedang maintenance pada suatu server, segera ubah status switch menjadi "Nonaktif" agar pelanggan tidak mengalami gagal order.',
        'Gunakan fitur Pagination untuk menavigasi ribuan SKU layanan secara cepat dan ringan.'
      ],
      tip: 'Pastikan saldo deposit di provider induk selalu mencukupi agar pesanan otomatis ter-submit tanpa pending.',
      targetTab: 'services'
    },
    {
      id: 'orders-sop',
      category: 'orders',
      badge: 'Operasional Pesanan',
      title: 'SOP Monitoring Pesanan & Auto-Refund',
      summary: 'Panduan meninjau antrean pesanan, status eksekusi API provider, dan penanganan pesanan bermasalah.',
      steps: [
        'Buka menu "Pesanan Pelanggan" dari sidebar.',
        'Pantau badge status: Pending (menunggu kirim ke server), Processing (sedang diproses provider), Completed (selesai).',
        'Jika status berubah menjadi "Canceled" oleh provider pusat, sistem secara otomatis melakukan "Auto-Refund" saldo ke akun pelanggan bersangkutan.',
        'Untuk pesanan Partial (terisi sebagian), sistem otomatis mengembalikan sisa dana secara proporsional.',
        'Gunakan pencarian ID Pesanan (#ORD-xxx) atau target Link untuk mencari keluhan pelanggan dengan cepat.'
      ],
      tip: 'Filter pesanan riil dan pesanan [DEMO] tersedia di pojok atas tabel untuk menjaga akurasi pelaporan.',
      targetTab: 'orders'
    },
    {
      id: 'rbac-sop',
      category: 'rbac',
      badge: 'Keamanan & Akses',
      title: 'SOP Manajemen RBAC & Role Akses Karyawan',
      summary: 'Pengaturan 25 hak akses granular untuk staf admin, customer service, keuangan, dan superadmin.',
      steps: [
        'Buka menu "Role & RBAC" dari sidebar (hanya dapat diakses oleh SuperAdmin).',
        'Pilih role yang ingin dikonfigurasi (SuperAdmin, Admin, atau Custom Role baru).',
        'Centang izin perizinan spesifik pada masing-masing modul (Katalog, Deposit, Pesanan, Company Profile).',
        'Gunakan "Role Simulator Switcher" di bar kanan atas header untuk mengetes secara langsung apa yang dilihat oleh role tersebut.',
        'Buat custom role seperti "Staff Finance" yang hanya memiliki akses ke modul Verifikasi Deposit tanpa bisa mengubah katalog.'
      ],
      tip: 'Izin SuperAdmin tidak dapat dihilangkan secara tidak sengaja untuk mencegah penguncian sistem (lockout guard).',
      targetTab: 'rbac'
    },
    {
      id: 'profile-sop',
      category: 'profile',
      badge: 'Branding & Landing',
      title: 'SOP Pengaturan Company Profile, SEO & GEO',
      summary: 'Mengelola narasi profil perusahaan, kontak WhatsApp bantuan, metadata SEO Google, dan jangkauan regional.',
      steps: [
        'Buka menu "Company Profile" di sidebar.',
        'Perbarui visi, misi, dan USP (Unique Selling Proposition) platform.',
        'Pastikan nomor WhatsApp dan jam operasional CS selalu akurat.',
        'Periksa target kata kunci regional (Jakarta, Surabaya, Bandung, Medan, Bali, dll) untuk mempertahankan dominasi SEO GEO lokal di search engine.'
      ],
      tip: 'Perubahan pada halaman ini langsung tersinkronisasi ke landing page pelanggan di Web Apps.',
      targetTab: 'profile'
    }
  ];

  $: filteredSops = sops.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || 
      item.title.toLowerCase().includes(query) || 
      item.summary.toLowerCase().includes(query) ||
      item.badge.toLowerCase().includes(query) ||
      item.steps.some(s => s.toLowerCase().includes(query));
    return matchesCat && matchesSearch;
  });

  function navigateTo(tab) {
    dispatch('navigate', tab);
  }
</script>

<div class="space-y-6">
  <!-- Header Banner -->
  <div class="ui-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900 text-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-900 border border-zinc-700/60 shadow-md">
    <div class="relative z-10 max-w-3xl">
      <div class="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-white/10 text-white border border-white/20 text-[11px] font-semibold mb-3">
        <span>📖 Pusat Panduan &amp; Standar Operasional (SOP)</span>
      </div>
      <h1 class="text-xl sm:text-2xl font-bold tracking-tight text-white">
        Buku Panduan Operasional Narasi Media Admin
      </h1>
      <p class="text-xs sm:text-sm text-zinc-300 mt-2 leading-relaxed">
        Dokumentasi resmi alur kerja administratif, persetujuan mutasi deposit QRIS, tata kelola margin katalog, troubleshooting pesanan, serta manajemen hak akses RBAC.
      </p>
    </div>
  </div>

  <!-- Search & Category Filters -->
  <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
    <!-- Category Tabs -->
    <div class="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
      <button
        type="button"
        on:click={() => activeCategory = 'all'}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeCategory === 'all' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}"
      >
        Semua SOP ({sops.length})
      </button>
      <button
        type="button"
        on:click={() => activeCategory = 'deposits'}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeCategory === 'deposits' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}"
      >
        💳 Deposit QRIS
      </button>
      <button
        type="button"
        on:click={() => activeCategory = 'services'}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeCategory === 'services' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}"
      >
        📦 Katalog Layanan
      </button>
      <button
        type="button"
        on:click={() => activeCategory = 'orders'}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeCategory === 'orders' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}"
      >
        📊 Pesanan &amp; Refund
      </button>
      <button
        type="button"
        on:click={() => activeCategory = 'rbac'}
        class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeCategory === 'rbac' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm font-semibold' : 'bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300'}"
      >
        🛡️ Akses &amp; RBAC
      </button>
    </div>

    <!-- Search input -->
    <div class="relative w-full sm:w-64">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari SOP atau kata kunci..."
        class="w-full pl-8 pr-3 py-1.5 rounded-lg text-xs bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-1 focus:ring-zinc-400 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
      />
      <svg class="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  </div>

  <!-- SOP List -->
  {#if filteredSops.length === 0}
    <div class="ui-card p-12 text-center rounded-xl">
      <p class="text-xs text-zinc-400">Tidak ada SOP yang cocok dengan pencarian "{searchQuery}".</p>
    </div>
  {:else}
    <div class="space-y-5">
      {#each filteredSops as sop}
        <div class="ui-card p-5 sm:p-6 rounded-2xl space-y-4 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-3">
            <div>
              <div class="flex items-center space-x-2">
                <span class="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
                  {sop.badge}
                </span>
                <h3 class="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
                  {sop.title}
                </h3>
              </div>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                {sop.summary}
              </p>
            </div>
            {#if sop.targetTab}
              <button
                type="button"
                on:click={() => navigateTo(sop.targetTab)}
                class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 text-xs font-semibold self-start sm:self-center transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                <span>Buka Modul Ini</span>
                <span>&rarr;</span>
              </button>
            {/if}
          </div>

          <!-- Step-by-Step Instructions -->
          <div class="space-y-2">
            <h4 class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 uppercase tracking-wider font-mono">
              Langkah Kerja Standar (Standard Procedure):
            </h4>
            <div class="grid grid-cols-1 gap-2 pt-1">
              {#each sop.steps as step, idx}
                <div class="flex items-start space-x-3 p-2.5 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800/80">
                  <span class="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[10px] font-bold font-mono flex items-center justify-center mt-0.5">
                    {idx + 1}
                  </span>
                  <span class="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                    {step}
                  </span>
                </div>
              {/each}
            </div>
          </div>

          <!-- Pro-Tip Box -->
          {#if sop.tip}
            <div class="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex items-start space-x-2">
              <span class="text-sm font-bold flex-shrink-0">💡</span>
              <p class="leading-relaxed">
                <strong>Catatan Penting:</strong> {sop.tip}
              </p>
            </div>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
