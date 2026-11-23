<script>
  import { onMount } from 'svelte';

  let companyName = 'PT Narasi Media Solusindo';
  let tagline = 'Infrastruktur Narasi & Optimasi Media Sosial Terdepan di Indonesia';
  let announcement = 'Bonus Saldo +10% untuk setiap deposit via QRIS Otomatis & Manual!';
  let whatsappNumber = '081234567890';
  let telegramLink = 'https://t.me/narasimedia_official';
  let address = 'Jl. Sudirman Central Business District (SCBD), Jakarta Selatan 12190';
  let operatingHours = '24 Jam Nonstop (Senin - Minggu)';
  let maintenanceMode = false;
  let feedback = '';

  onMount(() => {
    const saved = localStorage.getItem('bm_company_profile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        companyName = data.companyName || companyName;
        tagline = data.tagline || tagline;
        announcement = data.announcement || announcement;
        whatsappNumber = data.whatsappNumber || whatsappNumber;
        telegramLink = data.telegramLink || telegramLink;
        address = data.address || address;
        operatingHours = data.operatingHours || operatingHours;
        maintenanceMode = data.maintenanceMode || false;
      } catch (e) {}
    }
  });

  function saveSettings() {
    const data = {
      companyName,
      tagline,
      announcement,
      whatsappNumber,
      telegramLink,
      address,
      operatingHours,
      maintenanceMode
    };
    localStorage.setItem('bm_company_profile', JSON.stringify(data));
    feedback = 'Pengaturan Company Profile & Website berhasil disimpan!';
    setTimeout(() => (feedback = ''), 4000);
  }
</script>

<div class="space-y-6 max-w-4xl">
  {#if feedback}
    <div class="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in">
      <div class="flex items-center space-x-2 font-medium">
        <span>✓</span>
        <span>{feedback}</span>
      </div>
      <button type="button" on:click={() => (feedback = '')} class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-xs">✕</button>
    </div>
  {/if}

  <!-- Header -->
  <div>
    <div class="flex items-center space-x-2">
      <span class="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
      <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
        Pengaturan Company Profile & Landing Page Publik
      </h2>
    </div>
    <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
      Atur profil bisnis, teks pengumuman promo, nomor kontak customer support, dan informasi legalitas yang tampil di halaman depan website.
    </p>
  </div>

  <form on:submit|preventDefault={saveSettings} class="space-y-5">
    <!-- Identitas Perusahaan -->
    <div class="admin-card rounded-xl p-6 space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Identitas Bisnis & Perusahaan</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label for="company-name" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Nama Legal Perusahaan</label>
          <input
            id="company-name"
            type="text"
            bind:value={companyName}
            class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label for="tagline" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Tagline Utama</label>
          <input
            id="tagline"
            type="text"
            bind:value={tagline}
            class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div class="text-xs">
        <label for="address" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Alamat Kantor Operasional</label>
        <input
          id="address"
          type="text"
          bind:value={address}
          class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
        />
      </div>
    </div>

    <!-- Announcement & Promo Banner -->
    <div class="admin-card rounded-xl p-6 space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Banner Pengumuman & Promo</h3>

      <div class="text-xs">
        <label for="announcement-text" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Teks Banner Atas (Top Announcement Bar)</label>
        <input
          id="announcement-text"
          type="text"
          bind:value={announcement}
          placeholder="Teks berjalan / promo di bar atas..."
          class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
        />
      </div>
    </div>

    <!-- Kontak Support -->
    <div class="admin-card rounded-xl p-6 space-y-4">
      <h3 class="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono">Saluran Bantuan & Layanan Pelanggan (CS)</h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div>
          <label for="wa-cs" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Nomor WhatsApp CS (Official)</label>
          <input
            id="wa-cs"
            type="text"
            bind:value={whatsappNumber}
            placeholder="081234567890"
            class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
          />
        </div>

        <div>
          <label for="tg-cs" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Telegram Channel / CS</label>
          <input
            id="tg-cs"
            type="text"
            bind:value={telegramLink}
            placeholder="https://t.me/..."
            class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
          />
        </div>
      </div>

      <div class="text-xs">
        <label for="hours" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Jam Operasional Layanan</label>
        <input
          id="hours"
          type="text"
          bind:value={operatingHours}
          class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
        />
      </div>
    </div>

    <div class="flex items-center justify-end">
      <button
        type="submit"
        class="px-5 py-2.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
      >
        Simpan Pengaturan Company Profile
      </button>
    </div>
  </form>
</div>
