import { writable, derived } from 'svelte/store';

// ==============================================================================
// 1. DEFINISI MODUL & PERMISSION RBAC
// ==============================================================================
export const PERMISSION_MODULES = [
  {
    id: 'overview',
    name: 'Dashboard & Ringkasan',
    icon: 'layout-dashboard',
    permissions: [
      { id: 'overview.view', label: 'Lihat Dashboard Overview', description: 'Mengakses ringkasan omset, statistik, dan performa harian' }
    ]
  },
  {
    id: 'categories',
    name: 'Katalog Kategori',
    icon: 'folder',
    permissions: [
      { id: 'categories.view', label: 'Lihat Katalog Kategori', description: 'Melihat daftar kategori layanan' },
      { id: 'categories.create', label: 'Tambah Kategori Baru', description: 'Membuat entri kategori baru' },
      { id: 'categories.edit', label: 'Ubah Data Kategori', description: 'Mengedit nama, icon, dan urutan kategori' },
      { id: 'categories.delete', label: 'Hapus Kategori', description: 'Menghapus kategori beserta relasinya' }
    ]
  },
  {
    id: 'services',
    name: 'Katalog Layanan & Produk',
    icon: 'package',
    permissions: [
      { id: 'services.view', label: 'Lihat Katalog Layanan', description: 'Melihat seluruh daftar layanan dan harga' },
      { id: 'services.create', label: 'Tambah Layanan Baru', description: 'Menambahkan produk atau layanan baru ke katalog' },
      { id: 'services.edit', label: 'Ubah Data & Harga', description: 'Mengubah deskripsi, harga beli, dan harga jual' },
      { id: 'services.toggle', label: 'Aktif/Nonaktif Layanan', description: 'Mengubah status on/off operasional layanan' },
      { id: 'services.markup', label: 'Penyesuaian Margin Massal', description: 'Melakukan batch markup harga jual layanan' },
      { id: 'services.delete', label: 'Hapus Layanan', description: 'Menghapus layanan dari katalog aktif' }
    ]
  },
  {
    id: 'deposits',
    name: 'Verifikasi Deposit QRIS',
    icon: 'credit-card',
    permissions: [
      { id: 'deposits.view', label: 'Lihat Antrean Deposit', description: 'Melihat bukti transfer dan mutasi masuk' },
      { id: 'deposits.approve', label: 'Setujui & Kredit Saldo', description: 'Menyetujui deposit dan menambahkan saldo user' },
      { id: 'deposits.reject', label: 'Tolak Pengajuan Deposit', description: 'Menolak deposit jika mutasi tidak sesuai' }
    ]
  },
  {
    id: 'orders',
    name: 'Pesanan Pelanggan',
    icon: 'shopping-bag',
    permissions: [
      { id: 'orders.view', label: 'Lihat Riwayat Pesanan', description: 'Melihat seluruh transaksi pesanan pelanggan' },
      { id: 'orders.update_status', label: 'Ubah Status Pesanan', description: 'Memperbarui status (Pending, In Progress, Completed, Canceled)' }
    ]
  },
  {
    id: 'users',
    name: 'Manajemen Pengguna',
    icon: 'users',
    permissions: [
      { id: 'users.view', label: 'Lihat Daftar Pengguna', description: 'Melihat profil dan riwayat akun user' },
      { id: 'users.adjust_balance', label: 'Sesuaikan Saldo Manual', description: 'Menambah atau memotong saldo akun secara manual' },
      { id: 'users.assign_role', label: 'Tugaskan Role ke User', description: 'Mengubah penugasan role dan hak akses pengguna' }
    ]
  },
  {
    id: 'profile',
    name: 'Company Profile & Web',
    icon: 'globe',
    permissions: [
      { id: 'profile.view', label: 'Lihat Pengaturan Profile', description: 'Melihat konfigurasi company profile & landing page' },
      { id: 'profile.edit', label: 'Ubah Konten Website', description: 'Menyimpan perubahan narasi, kontak, dan branding' }
    ]
  },
  {
    id: 'rbac',
    name: 'Role & Hak Akses (RBAC)',
    icon: 'shield-check',
    permissions: [
      { id: 'rbac.view', label: 'Lihat Manajemen RBAC', description: 'Melihat struktur role dan checklist hak akses' },
      { id: 'rbac.create_role', label: 'Buat Role Baru', description: 'Mendefinisikan peran kustom baru dengan izin terpilih' },
      { id: 'rbac.edit_role', label: 'Ubah Matrix Izin Role', description: 'Mengubah checklist izin pada role yang sudah ada' },
      { id: 'rbac.delete_role', label: 'Hapus Custom Role', description: 'Menghapus role kustom yang tidak lagi digunakan' }
    ]
  }
];

// Kumpulan seluruh permission ID yang valid
export const ALL_PERMISSION_IDS = PERMISSION_MODULES.flatMap((m) =>
  m.permissions.map((p) => p.id)
);

// ==============================================================================
// 2. DEFAULT ROLES (admin & superadmin)
// ==============================================================================
export const DEFAULT_ROLES = [
  {
    id: 'superadmin',
    name: 'Super Admin',
    slug: 'superadmin',
    badgeColor: 'violet',
    isSystem: true, // Tidak bisa dihapus
    description: 'Akses penuh tanpa batas ke seluruh modul sistem, pengaturan finansial, dan manajemen RBAC.',
    permissions: [...ALL_PERMISSION_IDS]
  },
  {
    id: 'admin',
    name: 'Admin Operasional',
    slug: 'admin',
    badgeColor: 'blue',
    isSystem: true, // Role default
    description: 'Akses operasional harian: mengelola katalog layanan, memproses pesanan, memverifikasi deposit QRIS, dan mengedit profil.',
    permissions: [
      'overview.view',
      'categories.view',
      'categories.create',
      'categories.edit',
      'services.view',
      'services.create',
      'services.edit',
      'services.toggle',
      'services.markup',
      'deposits.view',
      'deposits.approve',
      'deposits.reject',
      'orders.view',
      'orders.update_status',
      'users.view',
      'profile.view',
      'profile.edit'
    ]
  }
];

// Sample Initial Users for RBAC Assignment
export const INITIAL_USERS = [
  {
    id: 'usr-1',
    username: 'superadmin@narasimedia.id',
    name: 'Chief Administrator',
    roleId: 'superadmin',
    customPermissions: [], // override permissions jika ada
    lastActive: 'Baru saja'
  },
  {
    id: 'usr-2',
    username: 'admin.ops@narasimedia.id',
    name: 'Budi Operasional',
    roleId: 'admin',
    customPermissions: [],
    lastActive: '5 menit lalu'
  },
  {
    id: 'usr-3',
    username: 'finance@narasimedia.id',
    name: 'Siti Bendahara',
    roleId: 'admin',
    customPermissions: ['deposits.approve', 'deposits.reject'],
    lastActive: '12 menit lalu'
  },
  {
    id: 'usr-4',
    username: 'regiami',
    name: 'Regi Ami (Demo Staff)',
    roleId: 'admin',
    customPermissions: [],
    lastActive: 'Aktif saat ini'
  }
];

// ==============================================================================
// 3. PERSISTENT STORAGE HELPERS
// ==============================================================================
function loadFromStorage(key, fallback) {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (e) {
    console.error(`Gagal memuat ${key} dari storage:`, e);
    return fallback;
  }
}

function saveToStorage(key, value) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error(`Gagal menyimpan ${key} ke storage:`, e);
  }
}

// ==============================================================================
// 4. REACTIVE STORES
// ==============================================================================
// Daftar seluruh role (dimulai dari default roles + custom roles)
export const rolesStore = writable(loadFromStorage('narasi_admin_roles_v2', DEFAULT_ROLES));
rolesStore.subscribe((val) => saveToStorage('narasi_admin_roles_v2', val));

// Daftar user dan penugasan role mereka
export const usersStore = writable(loadFromStorage('narasi_admin_users_v2', INITIAL_USERS));
usersStore.subscribe((val) => saveToStorage('narasi_admin_users_v2', val));

// Role yang sedang aktif disimulasikan / digunakan di admin panel
export const activeRoleStore = writable(loadFromStorage('narasi_admin_active_role_id', 'superadmin'));
activeRoleStore.subscribe((val) => saveToStorage('narasi_admin_active_role_id', val));

// ==============================================================================
// 5. DERIVED STORES & PERMISSION CHECKERS
// ==============================================================================
// Menghitung role objek aktif saat ini
export const currentRole = derived([rolesStore, activeRoleStore], ([$roles, $activeRoleId]) => {
  return $roles.find((r) => r.id === $activeRoleId) || $roles[0] || DEFAULT_ROLES[0];
});

// Menghitung set permissions dari role aktif saat ini
export const currentPermissions = derived(currentRole, ($role) => {
  return new Set($role?.permissions || []);
});

/**
 * Memeriksa apakah role aktif memiliki hak akses tertentu
 */
export function hasPermission(permissionId, permissionsSet) {
  if (!permissionId) return true;
  return permissionsSet.has(permissionId);
}

/**
 * Memeriksa apakah role aktif dapat melihat tab tertentu di sidebar
 */
export function canAccessTab(tabId, permissionsSet) {
  switch (tabId) {
    case 'overview':
      return permissionsSet.has('overview.view');
    case 'categories':
      return permissionsSet.has('categories.view');
    case 'services':
      return permissionsSet.has('services.view');
    case 'deposits':
      return permissionsSet.has('deposits.view');
    case 'orders':
      return permissionsSet.has('orders.view');
    case 'users':
      return permissionsSet.has('users.view');
    case 'profile':
      return permissionsSet.has('profile.view');
    case 'rbac':
      return permissionsSet.has('rbac.view');
    default:
      return true;
  }
}

// ==============================================================================
// 6. ACTION DISPATCHERS
// ==============================================================================
export const rbacActions = {
  /**
   * Membuat Role Baru
   */
  createRole(roleData) {
    let result = null;
    rolesStore.update((roles) => {
      const slug = roleData.slug || roleData.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const newRole = {
        id: 'role-' + Date.now(),
        name: roleData.name.trim(),
        slug,
        badgeColor: roleData.badgeColor || 'emerald',
        isSystem: false,
        description: roleData.description?.trim() || 'Role kustom operasional',
        permissions: [...(roleData.permissions || [])]
      };
      result = newRole;
      return [...roles, newRole];
    });
    return result;
  },

  /**
   * Memperbarui Role & Matrix Izin
   */
  updateRole(roleId, updatedFields) {
    rolesStore.update((roles) => {
      return roles.map((r) => {
        if (r.id === roleId) {
          return {
            ...r,
            ...updatedFields,
            // Jika role adalah superadmin, selalu pertahankan full access
            permissions: r.id === 'superadmin' ? [...ALL_PERMISSION_IDS] : updatedFields.permissions ?? r.permissions
          };
        }
        return r;
      });
    });
  },

  /**
   * Menghapus Custom Role
   */
  deleteRole(roleId) {
    rolesStore.update((roles) => {
      // Pastikan role bawaan tidak bisa dihapus
      const target = roles.find((r) => r.id === roleId);
      if (target?.isSystem) {
        throw new Error('Role bawaan sistem (' + target.name + ') tidak dapat dihapus.');
      }
      return roles.filter((r) => r.id !== roleId);
    });

    // Jika role yang dihapus sedang aktif, fallback ke superadmin
    activeRoleStore.update((current) => (current === roleId ? 'superadmin' : current));
  },

  /**
   * Memperbarui Penugasan Role & Custom Overrides Pengguna
   */
  updateUserAccess(userId, roleId, customPermissions = []) {
    usersStore.update((users) => {
      return users.map((u) => {
        if (u.id === userId) {
          return { ...u, roleId, customPermissions };
        }
        return u;
      });
    });
  },

  /**
   * Tambah User Baru ke Daftar RBAC
   */
  addUser(userData) {
    usersStore.update((users) => {
      const newUser = {
        id: 'usr-' + Date.now(),
        username: userData.username.trim(),
        name: userData.name.trim(),
        roleId: userData.roleId || 'admin',
        customPermissions: userData.customPermissions || [],
        lastActive: 'Baru dibuat'
      };
      return [...users, newUser];
    });
  },

  /**
   * Ganti Role Aktif
   */
  setActiveRole(roleId) {
    activeRoleStore.set(roleId);
  },

  /**
   * Reset ke Default Roles
   */
  resetToDefaults() {
    rolesStore.set(DEFAULT_ROLES);
    usersStore.set(INITIAL_USERS);
    activeRoleStore.set('superadmin');
  }
};
