<script>
  import {
    rolesStore,
    usersStore,
    activeRoleStore,
    currentRole,
    currentPermissions,
    PERMISSION_MODULES,
    ALL_PERMISSION_IDS,
    rbacActions
  } from '../stores/rbacStore';

  // Sub-tab: 'roles' (Daftar & Matrix Role) atau 'users' (Akses Pengguna & Checklist Personal)
  let activeTab = 'roles';

  // State Feedback / Toast
  let toastMessage = '';
  let toastType = 'success';
  let toastTimeout = null;

  function showToast(msg, type = 'success') {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage = msg;
    toastType = type;
    toastTimeout = setTimeout(() => {
      toastMessage = '';
    }, 4000);
  }

  // ==============================================================================
  // MODAL: FORM ROLE (BUAT ROLE BARU / EDIT MATRIX IZIN)
  // ==============================================================================
  let showRoleModal = false;
  let isEditingRole = false;
  let editingRoleId = null;

  let roleForm = {
    name: '',
    slug: '',
    description: '',
    badgeColor: 'emerald',
    permissions: []
  };

  const BADGE_COLORS = [
    { id: 'emerald', label: 'Emerald / Hijau', class: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30' },
    { id: 'blue', label: 'Blue / Biru', class: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30' },
    { id: 'amber', label: 'Amber / Kuning', class: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30' },
    { id: 'rose', label: 'Rose / Merah', class: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30' },
    { id: 'violet', label: 'Violet / Ungu', class: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/30' },
    { id: 'cyan', label: 'Cyan / Biru Langit', class: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30' }
  ];

  function openCreateRoleModal() {
    isEditingRole = false;
    editingRoleId = null;
    roleForm = {
      name: '',
      slug: '',
      description: '',
      badgeColor: 'emerald',
      permissions: ['overview.view', 'orders.view'] // default minimal
    };
    showRoleModal = true;
  }

  function openEditRoleModal(role) {
    isEditingRole = true;
    editingRoleId = role.id;
    roleForm = {
      name: role.name,
      slug: role.slug,
      description: role.description || '',
      badgeColor: role.badgeColor || 'emerald',
      permissions: [...role.permissions]
    };
    showRoleModal = true;
  }

  function togglePermission(permId) {
    if (editingRoleId === 'superadmin') {
      showToast('Super Admin memiliki hak akses mutlak yang tidak dapat dikurangi', 'error');
      return;
    }
    if (roleForm.permissions.includes(permId)) {
      roleForm.permissions = roleForm.permissions.filter((p) => p !== permId);
    } else {
      roleForm.permissions = [...roleForm.permissions, permId];
    }
  }

  function toggleModulePermissions(moduleObj) {
    if (editingRoleId === 'superadmin') return;
    const modPermIds = moduleObj.permissions.map((p) => p.id);
    const allSelected = modPermIds.every((id) => roleForm.permissions.includes(id));

    if (allSelected) {
      // Hapus semua izin modul ini
      roleForm.permissions = roleForm.permissions.filter((p) => !modPermIds.includes(p));
    } else {
      // Tambahkan seluruh izin modul ini
      const missing = modPermIds.filter((id) => !roleForm.permissions.includes(id));
      roleForm.permissions = [...roleForm.permissions, ...missing];
    }
  }

  function selectAllPermissions() {
    if (editingRoleId === 'superadmin') return;
    roleForm.permissions = [...ALL_PERMISSION_IDS];
  }

  function deselectAllPermissions() {
    if (editingRoleId === 'superadmin') return;
    roleForm.permissions = [];
  }

  function handleSaveRole() {
    if (!roleForm.name.trim()) {
      showToast('Nama role wajib diisi', 'error');
      return;
    }

    if (isEditingRole) {
      rbacActions.updateRole(editingRoleId, {
        name: roleForm.name.trim(),
        description: roleForm.description.trim(),
        badgeColor: roleForm.badgeColor,
        permissions: roleForm.permissions
      });
      showToast(`Role "${roleForm.name}" dan matrix izin berhasil diperbarui.`);
    } else {
      const created = rbacActions.createRole(roleForm);
      showToast(`Role baru "${created.name}" berhasil dibuat dengan ${created.permissions.length} izin.`);
    }
    showRoleModal = false;
  }

  function handleDeleteRole(role) {
    if (role.isSystem) {
      showToast(`Role bawaan (${role.name}) tidak boleh dihapus.`, 'error');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus role "${role.name}"? Pengguna dengan role ini akan dialihkan ke Admin.`)) {
      try {
        rbacActions.deleteRole(role.id);
        showToast(`Role "${role.name}" telah dihapus.`);
      } catch (e) {
        showToast(e.message, 'error');
      }
    }
  }

  // ==============================================================================
  // MODAL: FORM AKSES PENGGUNA (USER RBAC & PERSONAL CHECKLIST)
  // ==============================================================================
  let showUserModal = false;
  let editingUser = null;
  let userRoleId = 'admin';
  let userCustomPermissions = [];

  function openEditUserAccessModal(user) {
    editingUser = user;
    userRoleId = user.roleId || 'admin';
    userCustomPermissions = [...(user.customPermissions || [])];
    showUserModal = true;
  }

  function toggleUserCustomPermission(permId) {
    if (userCustomPermissions.includes(permId)) {
      userCustomPermissions = userCustomPermissions.filter((p) => p !== permId);
    } else {
      userCustomPermissions = [...userCustomPermissions, permId];
    }
  }

  function handleSaveUserAccess() {
    if (!editingUser) return;
    rbacActions.updateUserAccess(editingUser.id, userRoleId, userCustomPermissions);
    showToast(`Hak akses pengguna "${editingUser.username}" berhasil diperbarui.`);
    showUserModal = false;
  }

  // Helper mendapatkan nama role dari ID
  function getRoleName(id, roles) {
    const found = roles.find((r) => r.id === id);
    return found ? found.name : id;
  }

  function getRoleBadgeColor(id, roles) {
    const found = roles.find((r) => r.id === id);
    return found?.badgeColor || 'zinc';
  }
</script>

<div class="space-y-6">
  <!-- Toast Feedback Notifikasi -->
  {#if toastMessage}
    <div
      class="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-medium flex items-center space-x-2.5 transition-all {toastType === 'success' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 border border-zinc-700/50' : 'bg-rose-600 text-white'}"
    >
      <span>{toastType === 'success' ? '✓' : '⚠'}</span>
      <span>{toastMessage}</span>
      <button
        type="button"
        on:click={() => { if (toastTimeout) clearTimeout(toastTimeout); toastMessage = ''; }}
        class="ml-2 pl-1.5 opacity-70 hover:opacity-100 text-xs font-bold"
      >
        ✕
      </button>
    </div>
  {/if}

  <!-- Header Banner RBAC -->
  <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
    <div>
      <div class="flex items-center space-x-2.5">
        <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center font-bold text-sm">
          🛡️
        </div>
        <div>
          <h2 class="text-base font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
            Role & Hak Akses (Role-Based Access Control)
          </h2>
          <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Kelola role default <code class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">superadmin</code> dan <code class="px-1 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200">admin</code>, buat peran kustom, serta atur izin akses melalui checklist per modul.
          </p>
        </div>
      </div>
    </div>

    <!-- Quick Action Buttons -->
    <div class="flex items-center space-x-2.5">
      <button
        type="button"
        on:click={openCreateRoleModal}
        class="px-3.5 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5"
      >
        <span>+</span>
        <span>Buat Role Baru</span>
      </button>
      <button
        type="button"
        on:click={() => { if (confirm('Kembalikan role & user ke konfigurasi awal?')) { rbacActions.resetToDefaults(); showToast('Konfigurasi role berhasil direset ke default.'); } }}
        class="px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-colors"
        title="Reset ke role awal"
      >
        Reset Default
      </button>
    </div>
  </div>

  <!-- Sub Navigation Tabs -->
  <div class="flex items-center space-x-1 border-b border-zinc-200 dark:border-zinc-800 pb-2">
    <button
      type="button"
      on:click={() => (activeTab = 'roles')}
      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeTab === 'roles' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}"
    >
      Daftar Role & Matrix Izin ({$rolesStore.length})
    </button>
    <button
      type="button"
      on:click={() => (activeTab = 'users')}
      class="px-3 py-1.5 rounded-lg text-xs font-medium transition-all {activeTab === 'users' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-semibold' : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'}"
    >
      Penugasan & Checklist Pengguna ({$usersStore.length})
    </button>
  </div>

  <!-- ============================================================================== -->
  <!-- TAB 1: DAFTAR ROLE & MATRIX IZIN -->
  <!-- ============================================================================== -->
  {#if activeTab === 'roles'}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {#each $rolesStore as role}
        <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all flex flex-col justify-between space-y-4">
          <!-- Role Top: Badge & Status -->
          <div class="space-y-2">
            <div class="flex items-center justify-between">
              <span class="text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold border {role.id === 'superadmin' ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30' : role.id === 'admin' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'}">
                {role.isSystem ? 'Role Bawaan Sistem' : 'Role Kustom'}
              </span>
              {#if role.id === 'superadmin'}
                <span class="text-[10px] text-zinc-400 font-mono font-medium">Full Access</span>
              {:else}
                <span class="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono font-medium">
                  {role.permissions.length} / {ALL_PERMISSION_IDS.length} Izin
                </span>
              {/if}
            </div>

            <div>
              <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center space-x-1.5">
                <span>{role.name}</span>
                <span class="text-[10px] text-zinc-400 font-mono font-normal">({role.slug})</span>
              </h3>
              <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                {role.description}
              </p>
            </div>
          </div>

          <!-- Permissions Mini Preview / Highlights -->
          <div class="border-t border-zinc-100 dark:border-zinc-800/80 pt-3 space-y-1.5">
            <div class="text-[10px] font-mono text-zinc-400 uppercase font-semibold">Cakupan Akses:</div>
            <div class="flex flex-wrap gap-1">
              {#if role.id === 'superadmin'}
                <span class="text-[10px] px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 font-mono font-medium">
                  Semua Modul & Aksi (100%)
                </span>
              {:else}
                {#each PERMISSION_MODULES as mod}
                  {@const hasMod = mod.permissions.some(p => role.permissions.includes(p.id))}
                  {#if hasMod}
                    <span class="text-[10px] px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono">
                      ✓ {mod.name.split(' ')[0]}
                    </span>
                  {/if}
                {/each}
              {/if}
            </div>
          </div>

          <!-- Bottom Action Buttons -->
          <div class="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800 text-xs">
            <button
              type="button"
              on:click={() => openEditRoleModal(role)}
              class="px-2.5 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors flex items-center space-x-1"
            >
              <span>⚙</span>
              <span>{role.id === 'superadmin' ? 'Lihat Matrix Izin' : 'Edit Matrix Izin'}</span>
            </button>

            {#if !role.isSystem}
              <button
                type="button"
                on:click={() => handleDeleteRole(role)}
                class="px-2.5 py-1.5 rounded-lg text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium"
                title="Hapus custom role"
              >
                Hapus
              </button>
            {/if}
          </div>
        </div>
      {/each}
    </div>
  {/if}

  <!-- ============================================================================== -->
  <!-- TAB 2: PENUGASAN & CHECKLIST AKSES USER -->
  <!-- ============================================================================== -->
  {#if activeTab === 'users'}
    <div class="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden shadow-sm">
      <div class="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <div>
          <h3 class="text-xs font-bold text-zinc-900 dark:text-zinc-100 uppercase tracking-wider font-mono">
            Daftar Akun Pengguna & Hak Akses
          </h3>
          <p class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
            Pilih pengguna untuk menugaskan Role bawaan/kustom, serta berikan checklist izin tambahan khusus pengguna jika dibutuhkan.
          </p>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs">
          <thead class="bg-zinc-50 dark:bg-zinc-800/40 text-[10px] font-mono text-zinc-400 uppercase tracking-wider border-b border-zinc-200 dark:border-zinc-800">
            <tr>
              <th class="py-2.5 px-4">Pengguna</th>
              <th class="py-2.5 px-4">Role Ditugaskan</th>
              <th class="py-2.5 px-4">Checklist Override Khusus</th>
              <th class="py-2.5 px-4">Status</th>
              <th class="py-2.5 px-4 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-zinc-100 dark:divide-zinc-800/60 font-sans">
            {#each $usersStore as user}
              <tr class="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/20 transition-colors">
                <td class="py-3 px-4">
                  <div class="flex items-center space-x-2.5">
                    <div class="w-7 h-7 rounded-full bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-mono text-[10px] font-bold flex items-center justify-center">
                      {user.username.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div class="font-semibold text-zinc-900 dark:text-zinc-100">{user.name}</div>
                      <div class="text-[11px] text-zinc-400 font-mono">{user.username}</div>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="text-[10px] font-mono px-2 py-0.5 rounded font-bold border {user.roleId === 'superadmin' ? 'bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/30' : user.roleId === 'admin' ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/30' : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30'}">
                    {getRoleName(user.roleId, $rolesStore)}
                  </span>
                </td>
                <td class="py-3 px-4">
                  {#if user.customPermissions && user.customPermissions.length > 0}
                    <div class="flex flex-wrap gap-1">
                      {#each user.customPermissions as cp}
                        <span class="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 font-semibold">
                          +{cp}
                        </span>
                      {/each}
                    </div>
                  {:else}
                    <span class="text-[11px] text-zinc-400 font-mono italic">Inherit murni dari role</span>
                  {/if}
                </td>
                <td class="py-3 px-4 text-zinc-500 dark:text-zinc-400 text-[11px] font-mono">
                  {user.lastActive}
                </td>
                <td class="py-3 px-4 text-right">
                  <button
                    type="button"
                    on:click={() => openEditUserAccessModal(user)}
                    class="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 font-medium transition-colors"
                  >
                    Atur Akses & Checklist
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <!-- ============================================================================== -->
  <!-- MODAL: BUAT / EDIT ROLE DENGAN CHECKLIST PERIZINAN PER MODUL -->
  <!-- ============================================================================== -->
  {#if showRoleModal}
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      on:keydown={(e) => e.key === 'Escape' && (showRoleModal = false)}
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      on:click|self={() => (showRoleModal = false)}
    >
      <div class="relative max-w-3xl w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div>
            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              {isEditingRole ? `Edit Role: ${roleForm.name}` : 'Buat Role Baru'}
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Tentukan identitas peran dan centang checklist izin yang diberikan untuk modul-modul sistem.
            </p>
          </div>
          <button
            type="button"
            on:click={() => (showRoleModal = false)}
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body (Scrollable Checklist Matrix) -->
        <div class="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
          <!-- Role Metadata Form -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label for="role-name-input" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono mb-1">
                Nama Role <span class="text-rose-500">*</span>
              </label>
              <input
                id="role-name-input"
                type="text"
                bind:value={roleForm.name}
                disabled={editingRoleId === 'superadmin'}
                placeholder="Contoh: Finance & Accounting"
                class="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
            <div>
              <label for="role-badge-select" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono mb-1">
                Warna Badge
              </label>
              <select
                id="role-badge-select"
                bind:value={roleForm.badgeColor}
                disabled={editingRoleId === 'superadmin'}
                class="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                {#each BADGE_COLORS as color}
                  <option value={color.id}>{color.label}</option>
                {/each}
              </select>
            </div>
            <div class="md:col-span-2">
              <label for="role-desc-input" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono mb-1">
                Deskripsi Tanggung Jawab
              </label>
              <input
                id="role-desc-input"
                type="text"
                bind:value={roleForm.description}
                disabled={editingRoleId === 'superadmin'}
                placeholder="Contoh: Mengurus pencatatan omset, transaksi, dan verifikasi mutasi QRIS masuk"
                class="w-full px-3 py-2 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>

          <!-- Quick Action Buttons for Checklists -->
          <div class="flex items-center justify-between border-t border-b border-zinc-200 dark:border-zinc-800 py-3">
            <div class="flex items-center space-x-2">
              <span class="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                Matrix Checklist Izin:
              </span>
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold">
                {roleForm.permissions.length} dari {ALL_PERMISSION_IDS.length} Aktif
              </span>
            </div>

            {#if editingRoleId !== 'superadmin'}
              <div class="flex items-center space-x-2">
                <button
                  type="button"
                  on:click={selectAllPermissions}
                  class="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Centang Semua
                </button>
                <button
                  type="button"
                  on:click={deselectAllPermissions}
                  class="px-2.5 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[11px] font-medium text-zinc-700 dark:text-zinc-300"
                >
                  Hapus Semua
                </button>
              </div>
            {/if}
          </div>

          <!-- Grouped Modules Checklists -->
          <div class="space-y-4">
            {#each PERMISSION_MODULES as moduleObj}
              {@const modPermIds = moduleObj.permissions.map(p => p.id)}
              {@const allModChecked = modPermIds.every(id => roleForm.permissions.includes(id))}
              {@const someModChecked = modPermIds.some(id => roleForm.permissions.includes(id))}

              <div class="border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 bg-zinc-50/40 dark:bg-zinc-900/30">
                <!-- Module Header with Group Toggle -->
                <div class="flex items-center justify-between mb-3 pb-2 border-b border-zinc-200/60 dark:border-zinc-800">
                  <div class="flex items-center space-x-2">
                    <span class="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                      {moduleObj.name}
                    </span>
                  </div>

                  {#if editingRoleId !== 'superadmin'}
                    <button
                      type="button"
                      on:click={() => toggleModulePermissions(moduleObj)}
                      class="text-[11px] font-mono text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {allModChecked ? 'Batal Pilih Modul Ini' : 'Pilih Semua Modul Ini'}
                    </button>
                  {/if}
                </div>

                <!-- Checkbox Items -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {#each moduleObj.permissions as perm}
                    {@const isChecked = roleForm.permissions.includes(perm.id)}
                    <label
                      class="flex items-start space-x-2.5 p-2 rounded-lg border transition-all cursor-pointer {isChecked ? 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/50 text-zinc-900 dark:text-zinc-100' : 'bg-white dark:bg-zinc-800/40 border-zinc-200 dark:border-zinc-700/60 text-zinc-500 dark:text-zinc-400'}"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        disabled={editingRoleId === 'superadmin'}
                        on:change={() => togglePermission(perm.id)}
                        class="mt-0.5 rounded border-zinc-300 text-blue-600 focus:ring-blue-500"
                      />
                      <div class="flex-1 min-w-0">
                        <div class="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                          {perm.label}
                        </div>
                        <div class="text-[10px] text-zinc-400 dark:text-zinc-500 mt-0.5">
                          {perm.description}
                        </div>
                      </div>
                    </label>
                  {/each}
                </div>
              </div>
            {/each}
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/40 flex-shrink-0">
          <button
            type="button"
            on:click={() => (showRoleModal = false)}
            class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleSaveRole}
            class="px-5 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-sm transition-all"
          >
            {isEditingRole ? 'Simpan Perubahan Role' : 'Buat Role Sekarang'}
          </button>
        </div>
      </div>
    </div>
  {/if}

  <!-- ============================================================================== -->
  <!-- MODAL: ATUR AKSES & CHECKLIST PENGGUNA -->
  <!-- ============================================================================== -->
  {#if showUserModal && editingUser}
    <div
      role="dialog"
      aria-modal="true"
      tabindex="-1"
      on:keydown={(e) => e.key === 'Escape' && (showUserModal = false)}
      class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
      on:click|self={() => (showUserModal = false)}
    >
      <div class="relative max-w-xl w-full bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        <!-- Modal Header -->
        <div class="p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 class="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              Atur Hak Akses: {editingUser.name}
            </h3>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Akun: <code class="font-mono text-zinc-800 dark:text-zinc-200">{editingUser.username}</code>
            </p>
          </div>
          <button
            type="button"
            on:click={() => (showUserModal = false)}
            class="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-sm font-bold p-1 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        <!-- Modal Body -->
        <div class="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          <!-- Role Selection Dropdown -->
          <div>
            <label for="assign-role-select" class="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider font-mono mb-1.5">
              Tugaskan Role Utama
            </label>
            <select
              id="assign-role-select"
              bind:value={userRoleId}
              class="w-full px-3 py-2.5 rounded-lg bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {#each $rolesStore as role}
                <option value={role.id}>{role.name} ({role.slug})</option>
              {/each}
            </select>
          </div>

          <!-- Personal Checklist Permission Overrides -->
          <div class="space-y-3 pt-2">
            <div>
              <div class="font-semibold text-zinc-900 dark:text-zinc-100">
                Checklist Izin Khusus Pengguna (Personal Override)
              </div>
              <p class="text-[11px] text-zinc-400 mt-0.5">
                Tambahkan izin khusus tambahan untuk pengguna ini di luar paket bawaan role-nya:
              </p>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto p-1 border border-zinc-200 dark:border-zinc-800 rounded-lg">
              {#each PERMISSION_MODULES as mod}
                {#each mod.permissions as p}
                  {@const isChecked = userCustomPermissions.includes(p.id)}
                  <label
                    class="flex items-center space-x-2 p-2 rounded border cursor-pointer transition-colors {isChecked ? 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300' : 'bg-zinc-50 dark:bg-zinc-800/30 border-zinc-200 dark:border-zinc-700/50 text-zinc-600 dark:text-zinc-400'}"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      on:change={() => toggleUserCustomPermission(p.id)}
                      class="rounded border-zinc-300 text-amber-600 focus:ring-amber-500"
                    />
                    <span class="truncate font-medium text-[11px]">{p.label}</span>
                  </label>
                {/each}
              {/each}
            </div>
          </div>
        </div>

        <!-- Modal Footer -->
        <div class="p-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0">
          <button
            type="button"
            on:click={() => (showUserModal = false)}
            class="px-4 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-xs font-medium text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            on:click={handleSaveUserAccess}
            class="px-5 py-2 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 hover:bg-zinc-800 dark:hover:bg-white text-xs font-semibold shadow-sm transition-all"
          >
            Simpan Hak Akses User
          </button>
        </div>
      </div>
    </div>
  {/if}
</div>
