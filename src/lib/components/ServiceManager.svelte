<script>
  import { onMount } from 'svelte';

  let categories = [];
  let services = [];
  let loading = true;
  let feedback = '';
  let errorMessage = '';

  // Filter & Search
  let searchQuery = '';
  let selectedCategoryFilter = 'all';
  let statusFilter = 'all'; // 'all', 'active', 'inactive'

  // Service Modal (Create & Edit)
  let showServiceModal = false;
  let isEditing = false;
  let serviceForm = {
    id: '',
    category_id: '',
    name: '',
    service_type: 'default',
    price_original: 10000,
    price_user: 13000,
    min_order: 100,
    max_order: 10000,
    refill_supported: true,
    refill_days: 30,
    description: '',
    provider_id: 'prov-1',
    provider_service_id: '',
    is_active: true
  };
  let customMarginPercent = 30;

  // Batch Markup Modal
  let showBatchModal = false;
  let batchMarkupPercent = 25;
  let batchTargetCategory = 'all';
  let isBatchApplying = false;

  // Category Manager Modal
  let showCategoryModal = false;
  let newCategoryName = '';
  let newCategoryIcon = 'instagram';
  let newCategoryOrder = 5;

  // Delete Confirmation Modal
  let deleteModal = {
    show: false,
    type: 'service', // 'service' | 'category'
    id: '',
    name: ''
  };

  onMount(async () => {
    await loadAllData();
  });

  async function loadAllData() {
    loading = true;
    errorMessage = '';
    try {
      const [catRes, srvRes] = await Promise.all([
        fetch('/api/categories').then(r => r.json()),
        fetch('/api/services').then(r => r.json())
      ]);

      if (catRes.success) categories = catRes.data;
      if (srvRes.success) services = srvRes.data;

      if (categories.length > 0 && !serviceForm.category_id) {
        serviceForm.category_id = categories[0].id;
      }
    } catch (e) {
      errorMessage = 'Gagal memuat data dari backend: ' + e.message;
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

  function setFeedback(msg) {
    feedback = msg;
    setTimeout(() => (feedback = ''), 4000);
  }

  // Filtered Services List
  $: filteredServices = services.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.provider_service_id && s.provider_service_id.includes(searchQuery));

    const matchesCategory =
      selectedCategoryFilter === 'all' || s.category_id === selectedCategoryFilter;

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && s.is_active) ||
      (statusFilter === 'inactive' && !s.is_active);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // KPI Calculations
  $: totalServices = services.length;
  $: activeServices = services.filter(s => s.is_active).length;
  $: avgMargin = totalServices > 0
    ? Math.round(
        services.reduce((acc, s) => {
          const orig = s.price_original?.amount || 0;
          const user = s.price_user?.amount || 0;
          return orig > 0 ? acc + ((user - orig) / orig) * 100 : acc;
        }, 0) / totalServices
      )
    : 0;

  // Open Create Service Modal
  function openCreateModal() {
    isEditing = false;
    const defaultCatId = categories.length > 0 ? categories[0].id : 'cat-ig';
    serviceForm = {
      id: '',
      category_id: defaultCatId,
      name: '',
      service_type: 'default',
      price_original: 10000,
      price_user: 13000,
      min_order: 100,
      max_order: 25000,
      refill_supported: true,
      refill_days: 30,
      description: '',
      provider_id: 'prov-1',
      provider_service_id: '',
      is_active: true
    };
    customMarginPercent = 30;
    showServiceModal = true;
  }

  // Open Edit Service Modal
  function openEditModal(srv) {
    isEditing = true;
    const orig = srv.price_original?.amount || 0;
    const user = srv.price_user?.amount || 0;
    customMarginPercent = orig > 0 ? Math.round(((user - orig) / orig) * 100) : 0;

    serviceForm = {
      id: srv.id,
      category_id: srv.category_id,
      name: srv.name,
      service_type: srv.service_type || 'default',
      price_original: orig,
      price_user: user,
      min_order: srv.min_order,
      max_order: srv.max_order,
      refill_supported: srv.refill_supported,
      refill_days: srv.refill_days,
      description: srv.description || '',
      provider_id: srv.provider_id || 'prov-1',
      provider_service_id: srv.provider_service_id || '',
      is_active: srv.is_active
    };
    showServiceModal = true;
  }

  function openDuplicateModal(srv) {
    isEditing = false;
    const orig = srv.price_original?.amount || 0;
    const user = srv.price_user?.amount || 0;
    customMarginPercent = orig > 0 ? Math.round(((user - orig) / orig) * 100) : 0;

    serviceForm = {
      id: '',
      category_id: srv.category_id,
      name: `${srv.name} (Copy)`,
      service_type: srv.service_type || 'default',
      price_original: orig,
      price_user: user,
      min_order: srv.min_order,
      max_order: srv.max_order,
      refill_supported: srv.refill_supported,
      refill_days: srv.refill_days,
      description: srv.description || '',
      provider_id: srv.provider_id || 'prov-1',
      provider_service_id: srv.provider_service_id || '',
      is_active: true
    };
    showServiceModal = true;
  }

  function applyMarginToPriceUser(pct) {
    customMarginPercent = pct;
    const orig = Number(serviceForm.price_original) || 0;
    serviceForm.price_user = Math.round(orig * (1 + pct / 100));
  }

  // Save (Create or Update) Service
  async function handleSaveService() {
    if (!serviceForm.name.trim()) {
      alert('Nama layanan wajib diisi.');
      return;
    }
    if (!serviceForm.category_id) {
      alert('Kategori wajib dipilih.');
      return;
    }

    try {
      if (isEditing) {
        const res = await fetch(`/api/admin/services/${serviceForm.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceForm)
        });
        const json = await res.json();
        if (json.success) {
          services = services.map(s => (s.id === serviceForm.id ? json.data : s));
          setFeedback(`Layanan #${serviceForm.id} berhasil diperbarui.`);
          showServiceModal = false;
        } else {
          alert('Gagal memperbarui: ' + json.message);
        }
      } else {
        const res = await fetch('/api/admin/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(serviceForm)
        });
        const json = await res.json();
        if (json.success) {
          services = [json.data, ...services];
          setFeedback(`Layanan #${json.data.id} berhasil ditambahkan.`);
          showServiceModal = false;
        } else {
          alert('Gagal menambahkan: ' + json.message);
        }
      }
    } catch (e) {
      alert('Terjadi kesalahan koneksi: ' + e.message);
    }
  }

  // Toggle Active/Inactive Status
  async function handleToggleStatus(srv) {
    try {
      const res = await fetch(`/api/admin/services/${srv.id}/toggle`, {
        method: 'POST'
      });
      const json = await res.json();
      if (json.success) {
        services = services.map(s => (s.id === srv.id ? json.data : s));
        setFeedback(json.message);
      }
    } catch (e) {
      alert('Gagal mengubah status: ' + e.message);
    }
  }

  // Prompt Delete Service
  function confirmDeleteService(srv) {
    deleteModal = {
      show: true,
      type: 'service',
      id: srv.id,
      name: srv.name
    };
  }

  // Execute Delete
  async function executeDelete() {
    try {
      if (deleteModal.type === 'service') {
        const res = await fetch(`/api/admin/services/${deleteModal.id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          services = services.filter(s => s.id !== deleteModal.id);
          setFeedback(`Layanan #${deleteModal.id} berhasil dihapus.`);
        }
      } else if (deleteModal.type === 'category') {
        const res = await fetch(`/api/admin/categories/${deleteModal.id}`, {
          method: 'DELETE'
        });
        const json = await res.json();
        if (json.success) {
          categories = categories.filter(c => c.id !== deleteModal.id);
          setFeedback(`Kategori #${deleteModal.id} berhasil dihapus.`);
        }
      }
    } catch (e) {
      alert('Gagal menghapus item: ' + e.message);
    } finally {
      deleteModal.show = false;
    }
  }

  // Apply Batch Markup
  async function handleApplyBatchMarkup() {
    isBatchApplying = true;
    try {
      const res = await fetch('/api/admin/services/batch-markup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          percentage: Number(batchMarkupPercent),
          category_id: batchTargetCategory === 'all' ? null : batchTargetCategory
        })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback(json.message);
        showBatchModal = false;
        await loadAllData();
      } else {
        alert('Gagal menerapkan markup: ' + json.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan: ' + e.message);
    } finally {
      isBatchApplying = false;
    }
  }

  // Add Category
  async function handleAddCategory() {
    if (!newCategoryName.trim()) {
      alert('Nama kategori tidak boleh kosong.');
      return;
    }
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          icon: newCategoryIcon,
          sort_order: Number(newCategoryOrder)
        })
      });
      const json = await res.json();
      if (json.success) {
        categories = [...categories, json.data];
        newCategoryName = '';
        setFeedback(`Kategori "${json.data.name}" berhasil dibuat.`);
      } else {
        alert('Gagal membuat kategori: ' + json.message);
      }
    } catch (e) {
      alert('Terjadi kesalahan: ' + e.message);
    }
  }

  function getCategoryName(catId) {
    const c = categories.find(item => item.id === catId);
    return c ? c.name : catId;
  }
</script>

<div class="space-y-6">
  <!-- Feedback Notification -->
  {#if feedback}
    <div class="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs flex items-center justify-between shadow-sm animate-in fade-in duration-200">
      <div class="flex items-center space-x-2 font-medium">
        <svg class="w-4 h-4 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
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

  <!-- Header & KPI Metric Summary -->
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
    <div>
      <div class="flex items-center space-x-2">
        <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
        <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
          Katalog Layanan & Produk (CRUD)
        </h2>
      </div>
      <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
        Kelola daftar layanan aktif, harga modal provider, harga jual client, margin keuntungan, dan status visibilitas web.
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
        <span>Tambah Layanan Baru</span>
      </button>

      <button
        type="button"
        on:click={() => (showBatchModal = true)}
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-medium transition-all shadow-sm"
      >
        <svg class="w-3.5 h-3.5 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
        </svg>
        <span>Atur Margin Global (%)</span>
      </button>

      <button
        type="button"
        on:click={() => (showCategoryModal = true)}
        class="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/80 text-xs font-medium transition-all shadow-sm"
      >
        <svg class="w-3.5 h-3.5 text-zinc-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>Kelola Kategori ({categories.length})</span>
      </button>
    </div>
  </div>

  <!-- Metric Badges (Linear style KPI cards) -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Total Layanan</div>
      <div class="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">{totalServices}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Tersedia di katalog</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Layanan Aktif (Web)</div>
      <div class="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">{activeServices}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Tampil ke client</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Rata-rata Margin</div>
      <div class="text-lg font-bold font-mono text-blue-600 dark:text-blue-400 mt-1">+{avgMargin}%</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Keuntungan kotor</div>
    </div>
    <div class="admin-card rounded-xl p-3.5">
      <div class="text-[10px] font-mono font-medium uppercase text-zinc-400">Kategori Platform</div>
      <div class="text-lg font-bold font-mono text-zinc-900 dark:text-zinc-100 mt-1">{categories.length}</div>
      <div class="text-[10px] text-zinc-500 mt-0.5">Platform sosmed</div>
    </div>
  </div>

  <!-- Filter & Search Toolbar -->
  <div class="admin-card rounded-xl p-3 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
    <!-- Search Bar -->
    <div class="relative flex-1 max-w-md">
      <svg class="w-3.5 h-3.5 absolute left-3 top-2.5 text-zinc-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="11" cy="11" r="8"></circle>
        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
      </svg>
      <input
        type="text"
        bind:value={searchQuery}
        placeholder="Cari nama layanan, ID (SRV-101), atau kode provider..."
        class="w-full pl-9 pr-3 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 transition-colors"
      />
    </div>

    <!-- Category & Status Filters -->
    <div class="flex items-center space-x-2 flex-wrap">
      <!-- Category select -->
      <select
        bind:value={selectedCategoryFilter}
        class="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
      >
        <option value="all">Semua Kategori</option>
        {#each categories as cat}
          <option value={cat.id}>{cat.name}</option>
        {/each}
      </select>

      <!-- Status Filter -->
      <select
        bind:value={statusFilter}
        class="px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
      >
        <option value="all">Semua Status</option>
        <option value="active">🟢 Hanya Aktif</option>
        <option value="inactive">⚪ Hanya Nonaktif</option>
      </select>
    </div>
  </div>

  <!-- Services Data Table (High Density) -->
  <div class="admin-card rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-sm">
    <div class="overflow-x-auto">
      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="bg-zinc-100/60 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-[10px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
            <th class="px-4 py-3 font-semibold">ID / Kategori</th>
            <th class="px-4 py-3 font-semibold">Nama Layanan</th>
            <th class="px-4 py-3 font-semibold text-right">Modal (Prov)</th>
            <th class="px-4 py-3 font-semibold text-right">Jual (User)</th>
            <th class="px-4 py-3 font-semibold text-right">Margin / Profit</th>
            <th class="px-4 py-3 font-semibold text-center">Status Web</th>
            <th class="px-4 py-3 font-semibold text-right">Aksi</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-zinc-200 dark:divide-zinc-800 text-xs">
          {#if loading}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-zinc-400">
                Memuat data layanan...
              </td>
            </tr>
          {:else if filteredServices.length === 0}
            <tr>
              <td colspan="7" class="px-4 py-8 text-center text-zinc-400">
                Tidak ada layanan yang sesuai dengan filter pencarian.
              </td>
            </tr>
          {:else}
            {#each filteredServices as srv}
              {@const orig = srv.price_original?.amount || 0}
              {@const user = srv.price_user?.amount || 0}
              {@const profit = user - orig}
              {@const profitPct = orig > 0 ? Math.round((profit / orig) * 100) : 0}

              <tr class="hover:bg-zinc-50/70 dark:hover:bg-zinc-900/40 transition-colors">
                <!-- ID & Category -->
                <td class="px-4 py-3 align-top whitespace-nowrap">
                  <div class="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-xs">
                    {srv.id}
                  </div>
                  <span class="inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700/60 max-w-[140px] truncate">
                    {getCategoryName(srv.category_id)}
                  </span>
                </td>

                <!-- Service Name & Badges -->
                <td class="px-4 py-3 align-top">
                  <div class="font-medium text-zinc-900 dark:text-zinc-100 leading-snug">
                    {srv.name}
                  </div>
                  <div class="flex items-center space-x-2 mt-1 text-[10px] text-zinc-400">
                    <span class="font-mono">Min: {srv.min_order.toLocaleString()} - Max: {srv.max_order.toLocaleString()}</span>
                    <span>•</span>
                    {#if srv.refill_supported}
                      <span class="text-emerald-600 dark:text-emerald-400 font-medium">Garansi {srv.refill_days} Hari</span>
                    {:else}
                      <span class="text-zinc-400">No Refill</span>
                    {/if}
                    {#if srv.provider_service_id}
                      <span>•</span>
                      <span class="font-mono text-zinc-400">ID Prov: #{srv.provider_service_id}</span>
                    {/if}
                  </div>
                  {#if srv.description}
                    <div class="text-[11px] text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                      {srv.description}
                    </div>
                  {/if}
                </td>

                <!-- Modal Price -->
                <td class="px-4 py-3 align-top text-right whitespace-nowrap font-mono text-zinc-500 dark:text-zinc-400">
                  {formatRupiah(orig)}
                </td>

                <!-- Selling Price -->
                <td class="px-4 py-3 align-top text-right whitespace-nowrap font-mono font-bold text-zinc-900 dark:text-zinc-100">
                  {formatRupiah(user)}
                </td>

                <!-- Profit & Margin -->
                <td class="px-4 py-3 align-top text-right whitespace-nowrap">
                  <div class="font-mono font-semibold {profit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}">
                    +{formatRupiah(profit)}
                  </div>
                  <span class="inline-block mt-0.5 text-[10px] font-mono px-1 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    +{profitPct}%
                  </span>
                </td>

                <!-- Status Toggle -->
                <td class="px-4 py-3 align-top text-center whitespace-nowrap">
                  <button
                    type="button"
                    on:click={() => handleToggleStatus(srv)}
                    class="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition-all {srv.is_active ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20' : 'bg-zinc-200/60 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-300/60'}"
                    title="Klik untuk ubah visibilitas layanan di web user"
                  >
                    <span class="w-1.5 h-1.5 rounded-full {srv.is_active ? 'bg-emerald-500' : 'bg-zinc-400'}"></span>
                    <span>{srv.is_active ? 'Aktif (Tampil)' : 'Nonaktif (Sembunyi)'}</span>
                  </button>
                </td>

                <!-- Actions: Edit & Delete -->
                <td class="px-4 py-3 align-top text-right whitespace-nowrap">
                  <div class="flex items-center justify-end space-x-1">
                    <button
                      type="button"
                      on:click={() => openDuplicateModal(srv)}
                      class="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      title="Duplikat Layanan"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      on:click={() => openEditModal(srv)}
                      class="p-1.5 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
                      title="Edit Layanan"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button
                      type="button"
                      on:click={() => confirmDeleteService(srv)}
                      class="p-1.5 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                      title="Hapus Layanan"
                    >
                      <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
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

  <!-- MODAL: Create / Edit Service -->
  {#if showServiceModal}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-2xl w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-5 my-8"
      >
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <div>
            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isEditing ? `Edit Layanan: #${serviceForm.id}` : 'Tambah Layanan Baru'}
            </h3>
            <p class="text-xs text-zinc-500 mt-0.5">Konfigurasi detail spesifikasi layanan dan kalkulasi harga.</p>
          </div>
          <button
            type="button"
            on:click={() => (showServiceModal = false)}
            class="p-1 rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm"
          >
            ✕
          </button>
        </div>

        <form on:submit|preventDefault={handleSaveService} class="space-y-4 text-xs">
          <!-- ID & Category -->
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label for="form-id" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                ID Layanan (Opsional)
              </label>
              <input
                id="form-id"
                type="text"
                bind:value={serviceForm.id}
                placeholder="Contoh: SRV-105 (Auto-generated jika kosong)"
                disabled={isEditing}
                class="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono disabled:opacity-60 focus:outline-none focus:border-zinc-500"
              />
            </div>
            <div>
              <label for="form-category" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                Kategori Platform
              </label>
              <select
                id="form-category"
                bind:value={serviceForm.category_id}
                class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
              >
                {#each categories as cat}
                  <option value={cat.id}>{cat.name}</option>
                {/each}
              </select>
            </div>
          </div>

          <!-- Service Name -->
          <div>
            <label for="form-name" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
              Nama Lengkap Layanan *
            </label>
            <input
              id="form-name"
              type="text"
              bind:value={serviceForm.name}
              placeholder="Contoh: Instagram Followers Real Indonesia [Maks 50K] [Garansi 30 Hari]"
              required
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
            />
          </div>

          <!-- Pricing & Auto-Margin Calculator -->
          <div class="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
            <div class="flex items-center justify-between">
              <span class="font-semibold text-zinc-800 dark:text-zinc-200 text-xs">Kalkulator Harga & Margin</span>
              <!-- Quick margin presets -->
              <div class="flex items-center space-x-1">
                <span class="text-[10px] text-zinc-400 mr-1">Preset Margin:</span>
                {#each [20, 25, 30, 40, 50] as pct}
                  <button
                    type="button"
                    on:click={() => applyMarginToPriceUser(pct)}
                    class="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium {customMarginPercent === pct ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'}"
                  >
                    +{pct}%
                  </button>
                {/each}
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label for="form-price-orig" class="block text-zinc-600 dark:text-zinc-400 mb-1">
                  Harga Modal Provider (per 1.000)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-zinc-400 font-mono text-xs">Rp</span>
                  <input
                    id="form-price-orig"
                    type="number"
                    bind:value={serviceForm.price_original}
                    on:input={() => applyMarginToPriceUser(customMarginPercent)}
                    class="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
              <div>
                <label for="form-price-user" class="block text-zinc-600 dark:text-zinc-400 mb-1">
                  Harga Jual Client (per 1.000)
                </label>
                <div class="relative">
                  <span class="absolute left-3 top-2 text-zinc-400 font-mono text-xs">Rp</span>
                  <input
                    id="form-price-user"
                    type="number"
                    bind:value={serviceForm.price_user}
                    class="w-full pl-9 pr-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono font-bold focus:outline-none focus:border-zinc-500"
                  />
                </div>
              </div>
            </div>

            <div class="text-[11px] text-zinc-500 flex items-center justify-between font-mono pt-1">
              <span>Estimasi Profit: <strong class="text-emerald-600 dark:text-emerald-400">{formatRupiah(serviceForm.price_user - serviceForm.price_original)}</strong> / 1.000 pesanan</span>
              <span>Markup: <strong class="text-zinc-800 dark:text-zinc-200">+{serviceForm.price_original > 0 ? Math.round(((serviceForm.price_user - serviceForm.price_original) / serviceForm.price_original) * 100) : 0}%</strong></span>
            </div>
          </div>

          <!-- Min/Max Quantity & Refill -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label for="form-min" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Min Order</label>
              <input
                id="form-min"
                type="number"
                bind:value={serviceForm.min_order}
                class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
              />
            </div>
            <div>
              <label for="form-max" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Max Order</label>
              <input
                id="form-max"
                type="number"
                bind:value={serviceForm.max_order}
                class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 font-mono focus:outline-none"
              />
            </div>
            <div class="col-span-2">
              <label for="form-refill-days" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Garansi Refill (Hari)</label>
              <div class="flex items-center space-x-2">
                <input
                  id="form-refill-check"
                  type="checkbox"
                  bind:checked={serviceForm.refill_supported}
                  class="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900"
                />
                <label for="form-refill-check" class="text-xs text-zinc-600 dark:text-zinc-400">Ada Garansi</label>
                {#if serviceForm.refill_supported}
                  <input
                    id="form-refill-days"
                    type="number"
                    bind:value={serviceForm.refill_days}
                    placeholder="Hari"
                    class="w-20 px-2 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono"
                  />
                  <span class="text-[10px] text-zinc-400">hari</span>
                {/if}
              </div>
            </div>
          </div>

          <!-- Description -->
          <div>
            <label for="form-desc" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Deskripsi Layanan / Catatan Penting</label>
            <textarea
              id="form-desc"
              rows="2"
              bind:value={serviceForm.description}
              placeholder="Informasi kecepatan, syarat link, atau garansi untuk ditampilkan ke user..."
              class="w-full px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-zinc-500"
            ></textarea>
          </div>

          <!-- Visibility Checkbox -->
          <div class="flex items-center space-x-2 pt-1">
            <input
              id="form-is-active"
              type="checkbox"
              bind:checked={serviceForm.is_active}
              class="rounded border-zinc-300 dark:border-zinc-700 text-zinc-900"
            />
            <label for="form-is-active" class="font-medium text-zinc-800 dark:text-zinc-200">
              Tampilkan langsung di halaman pemesanan client (Aktif)
            </label>
          </div>

          <!-- Modal Action Buttons -->
          <div class="flex items-center justify-end space-x-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
            <button
              type="button"
              on:click={() => (showServiceModal = false)}
              class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-medium transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-4 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-zinc-200 text-xs font-semibold shadow-sm transition-all"
            >
              {isEditing ? 'Simpan Perubahan' : 'Buat Layanan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  {/if}

  <!-- MODAL: Batch Markup Global -->
  {#if showBatchModal}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-md w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <span class="text-amber-500">⚡</span>
            <span>Atur Margin Profit Massal</span>
          </h3>
          <button type="button" on:click={() => (showBatchModal = false)} class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm">✕</button>
        </div>

        <p class="text-xs text-zinc-500 leading-relaxed">
          Kalkulasi ulang harga jual pengguna (<strong class="text-zinc-800 dark:text-zinc-200">Price User</strong>) secara otomatis berdasarkan persentase markup dari harga modal provider.
        </p>

        <div class="space-y-3 text-xs">
          <div>
            <label for="batch-target-cat" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Target Kategori</label>
            <select
              id="batch-target-cat"
              bind:value={batchTargetCategory}
              class="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
            >
              <option value="all">Semua Kategori (Seluruh Layanan)</option>
              {#each categories as cat}
                <option value={cat.id}>{cat.name}</option>
              {/each}
            </select>
          </div>

          <div>
            <label for="batch-markup-pct" class="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">Persentase Margin Tambahan (%)</label>
            <div class="flex items-center space-x-2">
              <input
                id="batch-markup-pct"
                type="number"
                bind:value={batchMarkupPercent}
                class="w-24 px-3 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs font-mono font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
              <span class="text-xs text-zinc-500">% di atas harga modal</span>
            </div>
          </div>
        </div>

        <div class="flex items-center justify-end space-x-2 border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            on:click={() => (showBatchModal = false)}
            class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 text-xs font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleApplyBatchMarkup}
            disabled={isBatchApplying}
            class="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-sm transition-all disabled:opacity-50"
          >
            {isBatchApplying ? 'Menerapkan...' : 'Terapkan Margin Otomatis'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- MODAL: Category Manager -->
  {#if showCategoryModal}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-lg w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 shadow-2xl space-y-4"
      >
        <div class="flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
          <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
            <span>📁</span>
            <span>Kelola Kategori Layanan</span>
          </h3>
          <button type="button" on:click={() => (showCategoryModal = false)} class="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 text-sm">✕</button>
        </div>

        <!-- Add Category Form -->
        <div class="p-3.5 rounded-lg bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
          <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Tambah Kategori Baru</div>
          <div class="grid grid-cols-3 gap-2">
            <div class="col-span-2">
              <input
                type="text"
                bind:value={newCategoryName}
                placeholder="Nama Kategori (contoh: Threads Followers)"
                class="w-full px-3 py-1.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none"
              />
            </div>
            <div>
              <button
                type="button"
                on:click={handleAddCategory}
                class="w-full py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-xs font-semibold hover:bg-zinc-800 dark:hover:bg-zinc-200"
              >
                + Tambah
              </button>
            </div>
          </div>
        </div>

        <!-- Existing Categories List -->
        <div class="space-y-2 max-h-60 overflow-y-auto">
          <div class="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Daftar Kategori Terdaftar:</div>
          {#each categories as cat}
            <div class="flex items-center justify-between p-2.5 rounded-lg bg-white dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-xs">
              <div class="flex items-center space-x-2">
                <span class="w-2 h-2 rounded-full bg-zinc-400"></span>
                <span class="font-medium text-zinc-900 dark:text-zinc-100">{cat.name}</span>
                <span class="text-[10px] font-mono text-zinc-400">({cat.id})</span>
              </div>
              <button
                type="button"
                on:click={() => {
                  deleteModal = { show: true, type: 'category', id: cat.id, name: cat.name };
                }}
                class="text-zinc-400 hover:text-red-500 text-xs p-1"
                title="Hapus Kategori"
              >
                ✕
              </button>
            </div>
          {/each}
        </div>

        <div class="flex justify-end border-t border-zinc-200 dark:border-zinc-800 pt-3">
          <button
            type="button"
            on:click={() => (showCategoryModal = false)}
            class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- MODAL: Delete Confirmation -->
  {#if deleteModal.show}
    <div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        role="dialog"
        aria-modal="true"
        class="relative max-w-sm w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-2xl space-y-3"
      >
        <h4 class="text-sm font-bold text-red-600 dark:text-red-400 flex items-center space-x-2">
          <span>⚠️</span>
          <span>Konfirmasi Hapus</span>
        </h4>
        <p class="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Apakah Anda yakin ingin menghapus {deleteModal.type === 'service' ? 'layanan' : 'kategori'} <strong class="text-zinc-900 dark:text-zinc-100">"{deleteModal.name}"</strong>?
        </p>
        <p class="text-[11px] text-zinc-400">Tindakan ini permanen dan tidak dapat dibatalkan.</p>
        <div class="flex items-center justify-end space-x-2 pt-2 border-t border-zinc-200 dark:border-zinc-800">
          <button
            type="button"
            on:click={() => (deleteModal.show = false)}
            class="px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-medium"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={executeDelete}
            class="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm"
          >
            Hapus Sekarang
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
