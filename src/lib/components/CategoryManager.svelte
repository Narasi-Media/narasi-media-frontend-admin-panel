<script>
  import { onMount, createEventDispatcher } from 'svelte';

  const dispatch = createEventDispatcher();

  let categories = [];
  let services = [];
  let loading = true;
  let feedback = '';
  let errorMessage = '';

  // Search filter
  let searchQuery = '';

  // Modal: Tambah & Edit Kategori
  let showModal = false;
  let isEditing = false;
  let categoryForm = {
    id: '',
    name: '',
    icon: 'instagram',
    sort_order: 1
  };

  // Modal: Konfirmasi Hapus
  let deleteModal = {
    show: false,
    category: null,
    serviceCount: 0
  };

  const PLATFORM_ICONS = [
    { id: 'instagram', label: 'Instagram', color: 'from-pink-500 to-rose-500', icon: '📸' },
    { id: 'tiktok', label: 'TikTok', color: 'from-zinc-900 to-black text-cyan-400', icon: '🎵' },
    { id: 'youtube', label: 'YouTube', color: 'from-red-600 to-red-700', icon: '▶️' },
    { id: 'twitter', label: 'Twitter / X', color: 'from-sky-500 to-blue-600', icon: '🐦' },
    { id: 'facebook', label: 'Facebook', color: 'from-blue-600 to-indigo-700', icon: '👥' },
    { id: 'shopee', label: 'Shopee / Market', color: 'from-orange-500 to-amber-600', icon: '🛍️' },
    { id: 'telegram', label: 'Telegram', color: 'from-sky-400 to-blue-500', icon: '✈️' },
    { id: 'whatsapp', label: 'WhatsApp', color: 'from-emerald-500 to-green-600', icon: '💬' },
    { id: 'spotify', label: 'Spotify', color: 'from-emerald-600 to-teal-700', icon: '🎧' },
    { id: 'globe', label: 'Website / SEO', color: 'from-blue-500 to-cyan-600', icon: '🌐' },
    { id: 'star', label: 'Spesial / Populer', color: 'from-amber-400 to-amber-500', icon: '⭐' },
    { id: 'tag', label: 'Lainnya / Umum', color: 'from-zinc-500 to-zinc-600', icon: '🏷️' }
  ];

  onMount(async () => {
    await loadData();
  });

  async function loadData() {
    loading = true;
    errorMessage = '';
    try {
      const [catRes, srvRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/services').then(r => r.json())
      ]);

      if (catRes.success) {
        categories = catRes.data || [];
      } else {
        errorMessage = catRes.message || 'Gagal memuat kategori.';
      }

      if (srvRes.success) {
        services = srvRes.data || [];
      }
    } catch (e) {
      errorMessage = 'Koneksi error: ' + e.message;
    } finally {
      loading = false;
    }
  }

  function setFeedback(msg) {
    feedback = msg;
    setTimeout(() => (feedback = ''), 4000);
  }

  // Count services in each category
  function getServiceCount(catId) {
    return services.filter(s => s.category_id === catId).length;
  }

  // Helper slug generator
  function generateSlug(text) {
    return 'cat-' + text.toLowerCase().trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function onNameChange() {
    if (!isEditing && (!categoryForm.id || categoryForm.id.startsWith('cat-'))) {
      categoryForm.id = generateSlug(categoryForm.name);
    }
  }

  function openCreateModal() {
    isEditing = false;
    categoryForm = {
      id: '',
      name: '',
      icon: 'instagram',
      sort_order: categories.length + 1
    };
    showModal = true;
  }

  function openEditModal(cat) {
    isEditing = true;
    categoryForm = {
      id: cat.id,
      name: cat.name,
      icon: cat.icon || 'tag',
      sort_order: cat.sort_order || 1
    };
    showModal = true;
  }

  async function handleSaveCategory() {
    if (!categoryForm.name.trim()) {
      alert('Nama kategori wajib diisi.');
      return;
    }

    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/categories/${categoryForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: categoryForm.name.trim(),
            icon: categoryForm.icon,
            sort_order: Number(categoryForm.sort_order) || 1
          })
        });
        const json = await res.json();
        if (json.success) {
          categories = categories.map(c => (c.id === categoryForm.id ? json.data : c));
          setFeedback(`Kategori "${json.data.name}" berhasil diperbarui.`);
          showModal = false;
        } else {
          alert('Gagal memperbarui: ' + json.message);
        }
      } else {
        const catId = categoryForm.id.trim() || generateSlug(categoryForm.name);
        const res = await fetch('/api/admin/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: catId,
            name: categoryForm.name.trim(),
            icon: categoryForm.icon,
            sort_order: Number(categoryForm.sort_order) || (categories.length + 1)
          })
        });
        const json = await res.json();
        if (json.success) {
          categories = [...categories, json.data];
          setFeedback(`Kategori "${json.data.name}" berhasil dibuat.`);
          showModal = false;
        } else {
          alert('Gagal membuat kategori: ' + json.message);
        }
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi: ' + e.message);
    }
  }

  function openDeleteModal(cat) {
    deleteModal = {
      show: true,
      category: cat,
      serviceCount: getServiceCount(cat.id)
    };
  }

  async function confirmDeleteCategory() {
    if (!deleteModal.category) return;
    const catId = deleteModal.category.id;

    try {
      const res = await fetch(`/api/admin/categories/${catId}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        categories = categories.filter(c => c.id !== catId);
        setFeedback(`Kategori "${deleteModal.category.name}" berhasil dihapus.`);
      } else {
        alert('Gagal menghapus kategori: ' + json.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan saat menghapus: ' + e.message);
    } finally {
      deleteModal = { show: false, category: null, serviceCount: 0 };
    }
  }

  function navigateToServices(catId) {
    dispatch('navigate', { tab: 'services', categoryId: catId });
  }

  function getPlatformInfo(iconId) {
    return PLATFORM_ICONS.find(p => p.id === iconId) || {
      id: iconId,
      label: 'Umum',
      color: 'from-zinc-500 to-zinc-600',
      icon: '📁'
    };
  }

  $: filteredCategories = categories
    .filter(c => {
      const q = searchQuery.toLowerCase();
      return c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q);
    })
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  $: totalCategories = categories.length;
  $: totalServicesDistributed = services.length;
  $: mostPopularCategory = categories.reduce((max, c) => {
    const count = getServiceCount(c.id);
    return count > (max.count || 0) ? { name: c.name, count } : max;
  }, { name: '-', count: 0 });
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

  <!-- Header & Action Buttons -->
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
        <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Katalog Kategori Layanan
        </h2>
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        Kelola pengelompokan platform media sosial dan marketplace untuk mempermudah pengaturan dan pemilihan layanan di sistem.
      </p>
    </div>

    <!-- Action Buttons -->
    <div class="flex items-center flex-wrap gap-2">
      <button
        type="button"
        on:click={openCreateModal}
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
        <span>Tambah Kategori Baru</span>
      </button>

      <button
        type="button"
        on:click={loadData}
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-xs font-medium transition-all shadow-sm"
      >
        <svg class="w-3.5 h-3.5 {loading ? 'animate-spin' : ''}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="23 4 23 10 17 10"></polyline>
          <polyline points="1 20 1 14 7 14"></polyline>
          <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
        </svg>
        <span>Refresh</span>
      </button>
    </div>
  </div>

  <!-- KPI Metric Summary Cards -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Total Kategori</div>
      <div class="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">{totalCategories}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Platform aktif terdaftar</div>
    </div>

    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Layanan Terhubung</div>
      <div class="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">{totalServicesDistributed}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Total produk teralokasi</div>
    </div>

    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Kategori Terbanyak</div>
      <div class="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-1 truncate" title={mostPopularCategory.name}>
        {mostPopularCategory.name}
      </div>
      <div class="text-[10px] text-zinc-500 mt-0.5">{mostPopularCategory.count} Layanan terdaftar</div>
    </div>

    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Rata-rata Distribusi</div>
      <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
        {totalCategories > 0 ? (totalServicesDistributed / totalCategories).toFixed(1) : '0'}
      </div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Produk per kategori</div>
    </div>
  </div>

  <!-- Search & Filter Bar -->
  <div class="admin-card rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-3">
    <div class="w-full sm:w-80 relative">
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari kategori (nama / id)..."
        class="w-full pl-8 pr-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500"
      />
      <svg class="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
    </div>

    <div class="text-xs text-zinc-500 dark:text-zinc-400 font-mono">
      Menampilkan {filteredCategories.length} dari {categories.length} kategori
    </div>
  </div>

  <!-- Category Table -->
  <div class="admin-card rounded-xl overflow-hidden shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs">
        <thead class="bg-zinc-50/80 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase text-zinc-400">
          <tr>
            <th class="px-4 py-3 font-semibold">Urutan</th>
            <th class="px-4 py-3 font-semibold">Platform</th>
            <th class="px-4 py-3 font-semibold">Nama Kategori</th>
            <th class="px-4 py-3 font-semibold">ID / Slug</th>
            <th class="px-4 py-3 font-semibold">Jumlah Layanan</th>
            <th class="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800">
          {#if loading}
            <tr>
              <td colspan="6" class="px-4 py-12 text-center text-zinc-400">
                <div class="flex items-center justify-center space-x-2">
                  <div class="w-4 h-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin"></div>
                  <span>Memuat daftar kategori...</span>
                </div>
              </td>
            </tr>
          {:else if filteredCategories.length === 0}
            <tr>
              <td colspan="6" class="px-4 py-12 text-center text-zinc-400">
                <div class="space-y-2">
                  <div class="text-2xl">📁</div>
                  <div class="font-medium text-zinc-600 dark:text-zinc-300">Tidak ada kategori ditemukan</div>
                  <p class="text-xs text-zinc-400">Silakan buat kategori baru untuk mulai mengelompokkan layanan.</p>
                  <button
                    type="button"
                    on:click={openCreateModal}
                    class="mt-2 px-3 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold"
                  >
                    + Buat Kategori Pertama
                  </button>
                </div>
              </td>
            </tr>
          {:else}
            {#each filteredCategories as cat}
              {@const platform = getPlatformInfo(cat.icon)}
              {@const serviceCount = getServiceCount(cat.id)}

              <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                <!-- Urutan -->
                <td class="px-4 py-3.5 align-middle whitespace-nowrap">
                  <span class="inline-flex items-center justify-center w-6 h-6 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] font-bold text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60">
                    {cat.sort_order || 1}
                  </span>
                </td>

                <!-- Platform / Icon -->
                <td class="px-4 py-3.5 align-middle whitespace-nowrap">
                  <div class="flex items-center space-x-2">
                    <span class="text-base">{platform.icon}</span>
                    <span class="text-[11px] font-medium text-zinc-700 dark:text-zinc-300">
                      {platform.label}
                    </span>
                  </div>
                </td>

                <!-- Nama Kategori -->
                <td class="px-4 py-3.5 align-middle">
                  <div class="font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    {cat.name}
                  </div>
                </td>

                <!-- ID / Slug -->
                <td class="px-4 py-3.5 align-middle whitespace-nowrap">
                  <code class="px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800/80 font-mono text-[10px] text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60">
                    {cat.id}
                  </code>
                </td>

                <!-- Jumlah Layanan & Link -->
                <td class="px-4 py-3.5 align-middle whitespace-nowrap">
                  <button
                    type="button"
                    on:click={() => navigateToServices(cat.id)}
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all {serviceCount > 0 ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 hover:bg-blue-500/20 border border-blue-500/20' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-400 hover:bg-zinc-200'}"
                    title="Lihat semua layanan di kategori ini"
                  >
                    <span>{serviceCount} Layanan</span>
                    <span class="text-[10px]">→</span>
                  </button>
                </td>

                <!-- Aksi -->
                <td class="px-4 py-3.5 align-middle text-right whitespace-nowrap">
                  <div class="inline-flex items-center space-x-1">
                    <!-- Edit Button -->
                    <button
                      type="button"
                      on:click={() => openEditModal(cat)}
                      class="px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium transition-colors"
                      title="Edit Kategori"
                    >
                      Edit
                    </button>

                    <!-- Delete Button -->
                    <button
                      type="button"
                      on:click={() => openDeleteModal(cat)}
                      class="px-2 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-500/10 text-xs font-medium transition-colors"
                      title="Hapus Kategori"
                    >
                      ✕
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>
  </div>

  <!-- MODAL: Tambah / Edit Kategori -->
  {#if showModal}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-md w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isEditing ? `Edit Kategori: ${categoryForm.name}` : 'Tambah Kategori Layanan Baru'}
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">
              Kelola nama kategori dan ikon platform untuk menu dropdown.
            </p>
          </div>
          <button
            type="button"
            on:click={() => (showModal = false)}
            class="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm"
          >
            ✕
          </button>
        </div>

        <form on:submit|preventDefault={handleSaveCategory} class="space-y-4 text-xs">
          <!-- Nama Kategori -->
          <div>
            <label for="cat-name" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Kategori *
            </label>
            <input
              id="cat-name"
              type="text"
              bind:value={categoryForm.name}
              on:input={onNameChange}
              placeholder="Contoh: Shopee Followers & Marketplace"
              required
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <!-- ID Slug -->
          <div>
            <label for="cat-id" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              ID Slug Kategori
            </label>
            <input
              id="cat-id"
              type="text"
              bind:value={categoryForm.id}
              disabled={isEditing}
              placeholder="Contoh: cat-shopee"
              class="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono text-zinc-900 dark:text-zinc-100 disabled:opacity-60 focus:outline-none focus:border-zinc-500"
            />
            <p class="text-[10px] text-zinc-400 mt-1">Digunakan sebagai relasi unik ke produk layanan.</p>
          </div>

          <!-- Icon Platform Selector -->
          <div>
            <label for="cat-icon-select" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Platform & Icon
            </label>
            <div class="grid grid-cols-3 gap-1.5 max-h-36 overflow-y-auto p-1.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-lg border border-zinc-200 dark:border-zinc-800">
              {#each PLATFORM_ICONS as p}
                <button
                  type="button"
                  on:click={() => (categoryForm.icon = p.id)}
                  class="flex items-center space-x-1.5 p-1.5 rounded text-left transition-all {categoryForm.icon === p.id ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold shadow-sm' : 'hover:bg-zinc-200/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300'}"
                >
                  <span>{p.icon}</span>
                  <span class="truncate text-[11px]">{p.label}</span>
                </button>
              {/each}
            </div>
          </div>

          <!-- Urutan Tampilan (Sort Order) -->
          <div>
            <label for="cat-sort" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Urutan Tampilan
            </label>
            <input
              id="cat-sort"
              type="number"
              min="1"
              max="999"
              bind:value={categoryForm.sort_order}
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
            />
            <p class="text-[10px] text-zinc-400 mt-1">Nomor urutan menentukan posisi kategori di dropdown dan tab.</p>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end space-x-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <button
              type="button"
              on:click={() => (showModal = false)}
              class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-medium"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
            >
              {isEditing ? 'Simpan Perubahan' : 'Buat Kategori'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- MODAL: Konfirmasi Hapus Kategori -->
  {#if deleteModal.show && deleteModal.category}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-sm w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-4"
      >
        <div class="flex items-center space-x-3 text-red-600 dark:text-red-400">
          <div class="w-8 h-8 rounded-full bg-red-500/10 flex items-center justify-center text-sm font-bold">
            ⚠️
          </div>
          <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">Hapus Kategori?</h3>
        </div>

        <div class="space-y-2 text-xs text-zinc-600 dark:text-zinc-400">
          <p>
            Apakah Anda yakin ingin menghapus kategori <strong class="text-zinc-900 dark:text-zinc-100 font-semibold">{deleteModal.category.name}</strong>?
          </p>
          {#if deleteModal.serviceCount > 0}
            <div class="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-400 text-[11px] leading-relaxed">
              ⚠️ <strong>Peringatan:</strong> Ada <strong>{deleteModal.serviceCount} layanan</strong> yang saat ini berada di bawah kategori ini.
            </div>
          {/if}
        </div>

        <div class="flex items-center justify-end space-x-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            on:click={() => (deleteModal = { show: false, category: null, serviceCount: 0 })}
            class="px-3.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={confirmDeleteCategory}
            class="px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition-all"
          >
            Ya, Hapus Kategori
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
