/** Read the current language from localStorage (default: 'es') */
export function getLang(): 'es' | 'en' {
  const stored = localStorage.getItem('admin_language');
  return stored === 'en' ? 'en' : 'es';
}

/** Translate helper */
export function t(es: string, en: string): string {
  return getLang() === 'es' ? es : en;
}

/** All UI translations for the admin panel */
export const tr = {
  // ── App ────────────────────────────────────────────────────────────
  get appName() { return t('LagunApp Admin', 'LagunApp Admin'); },
  get adminPanel() { return t('Panel de Administración', 'Administration Panel'); },
  get restrictedAccess() { return t('Acceso restringido a administradores y gerentes de teatro', 'Restricted to administrators and theater managers'); },
  get invalidCredentials() { return t('Credenciales inválidas', 'Invalid credentials'); },

  // ── Login ──────────────────────────────────────────────────────────
  get emailLabel() { return t('Correo electrónico', 'Email'); },
  get emailPlaceholder() { return t('admin@lagunapp.com', 'admin@lagunapp.com'); },
  get password() { return t('Contraseña', 'Password'); },
  get signIn() { return t('Iniciar Sesión', 'Sign In'); },

  // ── Common actions ─────────────────────────────────────────────────
  get cancel() { return t('Cancelar', 'Cancel'); },
  get save() { return t('Guardar', 'Save'); },
  get create() { return t('Crear', 'Create'); },
  get edit() { return t('Editar', 'Edit'); },
  get delete() { return t('Eliminar', 'Delete'); },
  get update() { return t('Actualizar', 'Update'); },
  get add() { return t('Agregar', 'Add'); },
  get close() { return t('Cerrar', 'Close'); },
  get confirm() { return t('Confirmar', 'Confirm'); },
  get actions() { return t('Acciones', 'Actions'); },
  get apply() { return t('Aplicar', 'Apply'); },
  get retry() { return t('Reintentar', 'Retry'); },
  get upload() { return t('Subir', 'Upload'); },

  // ── Common states ──────────────────────────────────────────────────
  get loading() { return t('Cargando...', 'Loading...'); },
  get error() { return t('Error', 'Error'); },
  get success() { return t('Éxito', 'Success'); },
  get noResults() { return t('Sin resultados', 'No results'); },
  get active() { return t('Activo', 'Active'); },
  get inactive() { return t('Inactivo', 'Inactive'); },
  get enabled() { return t('Habilitado', 'Enabled'); },
  get disabled() { return t('Deshabilitado', 'Disabled'); },
  get verified() { return t('Verificado', 'Verified'); },
  get notVerified() { return t('No verificado', 'Not verified'); },
  get pending() { return t('Pendiente', 'Pending'); },
  get allStatus() { return t('Todos los estados', 'All statuses'); },
  get all() { return t('Todos', 'All'); },

  // ── Sidebar navigation ─────────────────────────────────────────────
  get mainSection() { return t('PRINCIPAL', 'MAIN'); },
  get contentSection() { return t('CONTENIDO', 'CONTENT'); },
  get businessSection() { return t('NEGOCIO', 'BUSINESS'); },
  get systemSection() { return t('SISTEMA', 'SYSTEM'); },
  get dashboard() { return t('Dashboard', 'Dashboard'); },
  get users() { return t('Usuarios', 'Users'); },
  get moderation() { return t('Moderación', 'Moderation'); },
  get events() { return t('Eventos', 'Events'); },
  get restaurants() { return t('Restaurantes', 'Restaurants'); },
  get tours() { return t('Tours', 'Tours'); },
  get theaters() { return t('Teatros', 'Theaters'); },
  get blog() { return t('Blog', 'Blog'); },
  get coupons() { return t('Cupones', 'Coupons'); },
  get tickets() { return t('Tickets', 'Tickets'); },
  get subscriptions() { return t('Suscripciones', 'Subscriptions'); },
  get advertising() { return t('Publicidad', 'Advertising'); },
  get wallet() { return t('Wallet', 'Wallet'); },
  get verifications() { return t('Verificaciones', 'Verifications'); },
  get notifications() { return t('Notificaciones', 'Notifications'); },
  get analytics() { return t('Analíticas', 'Analytics'); },
  get settings() { return t('Configuración', 'Settings'); },
  get lightMode() { return t('Modo claro', 'Light mode'); },
  get darkMode() { return t('Modo oscuro', 'Dark mode'); },

  // ── Page titles (AdminLayout) ──────────────────────────────────────
  get pageUsers() { return t('Usuarios', 'Users'); },
  get pageModerationTitle() { return t('Moderación', 'Moderation'); },
  get pageEventsTitle() { return t('Eventos', 'Events'); },
  get pageRestaurantsTitle() { return t('Restaurantes', 'Restaurants'); },
  get pageToursTitle() { return t('Tours', 'Tours'); },
  get pageTheatersTitle() { return t('Teatros', 'Theaters'); },
  get pageBlogTitle() { return t('Blog', 'Blog'); },
  get pageCouponsTitle() { return t('Cupones', 'Coupons'); },
  get pageTicketsTitle() { return t('Tickets', 'Tickets'); },
  get pageSubscriptionsTitle() { return t('Suscripciones', 'Subscriptions'); },
  get pageAdvertisingTitle() { return t('Publicidad', 'Advertising'); },
  get pageWalletTitle() { return t('Wallet', 'Wallet'); },
  get pageAnalyticsTitle() { return t('Analíticas', 'Analytics'); },
  get pageSettingsTitle() { return t('Configuración', 'Settings'); },

  // ── Dashboard ──────────────────────────────────────────────────────
  get totalUsers() { return t('Usuarios Totales', 'Total Users'); },
  get activeEvents() { return t('Eventos Activos', 'Active Events'); },
  get ticketsSold() { return t('Tickets Vendidos', 'Tickets Sold'); },
  get monthlyRevenue() { return t('Ingresos del Mes', 'Monthly Revenue'); },
  get monthlyRevenueChart() { return t('Ingresos Mensuales', 'Monthly Revenue'); },
  get ticketsByCategory() { return t('Tickets por Categoría', 'Tickets by Category'); },
  get userGrowth() { return t('Crecimiento de Usuarios', 'User Growth'); },
  get recentActivity() { return t('Actividad Reciente', 'Recent Activity'); },
  get revenue() { return t('Ingresos', 'Revenue'); },
  get usersLabel() { return t('Usuarios', 'Users'); },
  get ticketsLabel() { return t('Tickets', 'Tickets'); },

  // ── Analytics ──────────────────────────────────────────────────────
  get platformAnalytics() { return t('Analíticas de la Plataforma', 'Platform Analytics'); },
  get totalUsersAnalytics() { return t('Usuarios totales', 'Total users'); },
  get eventsThisMonth() { return t('Eventos este mes', 'Events this month'); },
  get totalRevenue() { return t('Ingresos totales', 'Total revenue'); },
  get retentionRate() { return t('Tasa retención', 'Retention rate'); },
  get topEventsBySales() { return t('Top Eventos por Venta', 'Top Events by Sales'); },
  get event() { return t('Evento', 'Event'); },
  get usersByCity() { return t('Usuarios por Ciudad', 'Users by City'); },
  get eventsByCategory() { return t('Eventos por Categoría', 'Events by Category'); },

  // ── Users ──────────────────────────────────────────────────────────
  get userManagement() { return t('Gestión de Usuarios', 'User Management'); },
  get createUser() { return t('+ Crear Usuario', '+ Create User'); },
  get searchByNameOrEmail() { return t('Buscar por nombre o email...', 'Search by name or email...'); },
  get noUsersFound() { return t('No se encontraron usuarios', 'No users found'); },
  get noUsersFoundHint() { return t('Intenta cambiar los filtros de búsqueda', 'Try changing the search filters'); },
  get totalLabel() { return t('Total', 'Total'); },
  get activeLabel() { return t('Activos', 'Active'); },
  get disabledLabel() { return t('Deshabilitados', 'Disabled'); },
  get verifiedLabel() { return t('Verificados', 'Verified'); },
  get allVerification() { return t('Verificación: Todos', 'Verification: All'); },
  get verifiedFilter() { return t('Verificados', 'Verified'); },
  get notVerifiedFilter() { return t('No verificados', 'Not verified'); },
  get nameCol() { return t('Nombre', 'Name'); },
  get emailCol() { return t('Email', 'Email'); },
  get roleCol() { return t('Rol', 'Role'); },
  get cityPlaceholder() { return t('Ciudad...', 'City...'); },

  // ── Roles ──────────────────────────────────────────────────────────
  get roleUser() { return t('Usuario', 'User'); },
  get roleOrganizer() { return t('Organizador', 'Organizer'); },
  get roleRestaurant() { return t('Restaurante', 'Restaurant'); },
  get roleScannerStaff() { return t('Staff Scanner', 'Scanner Staff'); },
  get roleAdmin() { return t('Admin', 'Admin'); },
  get roleTheaterManager() { return t('Gerente de Teatro', 'Theater Manager'); },

  // ── Events ─────────────────────────────────────────────────────────
  get eventManagement() { return t('Gestión de Eventos', 'Event Management'); },
  get createEvent() { return t('+ Crear Evento', '+ Create Event'); },
  get allStatuses() { return t('Todos los estados', 'All statuses'); },
  get draft() { return t('Borrador', 'Draft'); },
  get activeStatus() { return t('Activo', 'Active'); },
  get completedStatus() { return t('Completado', 'Completed'); },
  get cancelledStatus() { return t('Cancelado', 'Cancelled'); },
  get totalEvents() { return t('Total', 'Total'); },
  get completedLabel() { return t('Completados', 'Completed'); },
  get cancelledLabel() { return t('Cancelados', 'Cancelled'); },
  get draftsLabel() { return t('Borradores', 'Drafts'); },
  get totalTicketsSold() { return t('Tickets vendidos', 'Tickets sold'); },
  get totalRevenueStat() { return t('Ingresos totales', 'Total revenue'); },

  // ── Restaurants ────────────────────────────────────────────────────
  get restaurantManagement() { return t('Gestión de Restaurantes', 'Restaurant Management'); },
  get createRestaurant() { return t('+ Crear Restaurante', '+ Create Restaurant'); },
  get totalRestaurants() { return t('Total Restaurantes', 'Total Restaurants'); },
  get searchRestaurant() { return t('Buscar restaurante...', 'Search restaurant...'); },
  get allCuisines() { return t('Cocina: Todas', 'Cuisine: All'); },
  get allCities() { return t('Ciudad: Todas', 'City: All'); },
  get allSubscriptions() { return t('Suscripción: Todas', 'Subscription: All'); },
  get allRestaurantStatuses() { return t('Estado: Todos', 'Status: All'); },
  get withPromos() { return t('Con Promos', 'With Promos'); },
  get allPromos() { return t('Promos: Todos', 'Promos: All'); },

  // ── Blog ───────────────────────────────────────────────────────────
  get published() { return t('Publicado', 'Published'); },
  get archived() { return t('Archivado', 'Archived'); },

  // ── Coupons ────────────────────────────────────────────────────────
  get noLimit() { return t('Sin límite', 'No limit'); },

  // ── Tickets ────────────────────────────────────────────────────────
  get usedStatus() { return t('Usado', 'Used'); },
  get refundedStatus() { return t('Reembolsado', 'Refunded'); },

  // ── Tours ──────────────────────────────────────────────────────────
  get gastronomic() { return t('Gastronómico', 'Gastronomic'); },
  get cultural() { return t('Cultural', 'Cultural'); },
  get nightlifeType() { return t('Vida Nocturna', 'Nightlife'); },

  // ── Subscriptions ──────────────────────────────────────────────────
  get subscriptionActive() { return t('Activa', 'Active'); },
  get subscriptionCancelled() { return t('Cancelada', 'Cancelled'); },
  get subscriptionExpired() { return t('Expirada', 'Expired'); },
  get subscriptionSuspended() { return t('Suspendida', 'Suspended'); },

  // ── Advertising ────────────────────────────────────────────────────
  get adDraft() { return t('Borrador', 'Draft'); },
  get adActive() { return t('Activa', 'Active'); },
  get adPaused() { return t('Pausada', 'Paused'); },
  get adCompleted() { return t('Completada', 'Completed'); },
  get adCancelled() { return t('Cancelada', 'Cancelled'); },
  get placementBanner() { return t('Banner', 'Banner'); },
  get placementPromo() { return t('Promo', 'Promo'); },
  get placementFeatured() { return t('Destacado', 'Featured'); },
  get placementPopup() { return t('Popup', 'Popup'); },
  get allPlacements() { return t('Todos', 'All'); },

  // ── Wallet ─────────────────────────────────────────────────────────
  get walletActive() { return t('Activa', 'Active'); },
  get walletFrozen() { return t('Congelada', 'Frozen'); },
  get walletSuspended() { return t('Suspendida', 'Suspended'); },

  // ── Moderation ─────────────────────────────────────────────────────
  get allTypes() { return t('Todos los tipos', 'All types'); },
  get comment() { return t('Comentario', 'Comment'); },
  get chat() { return t('Chat', 'Chat'); },
  get user() { return t('Usuario', 'User'); },
  get restaurant() { return t('Restaurante', 'Restaurant'); },
  get review() { return t('Reseña', 'Review'); },
  get reviewed() { return t('Revisado', 'Reviewed'); },
  get resolved() { return t('Resuelto', 'Resolved'); },
  get dismissed() { return t('Descartado', 'Dismissed'); },

  // ── Verifications ──────────────────────────────────────────────────
  get identity() { return t('Identidad', 'Identity'); },
  get organizer() { return t('Organizador', 'Organizer'); },
  get inReview() { return t('En revisión', 'In review'); },
  get approved() { return t('Aprobado', 'Approved'); },
  get rejected() { return t('Rechazado', 'Rejected'); },

  // ── Notifications ──────────────────────────────────────────────────
  get dialogType() { return t('Dialog', 'Dialog'); },
  get pushType() { return t('Push', 'Push'); },
  get bothTypes() { return t('Ambos', 'Both'); },

  // ── Platform Settings ──────────────────────────────────────────────
  get platformSettings() { return t('Configuración de la Plataforma', 'Platform Settings'); },
  get commissions() { return t('Comisiones', 'Commissions'); },
  get rangeCol() { return t('Rango', 'Range'); },
  get commissionCol() { return t('Comisión', 'Commission'); },
  get generalSection() { return t('General', 'General'); },
  get platformName() { return t('Nombre de la plataforma', 'Platform name'); },
  get supportEmail() { return t('Email de soporte', 'Support email'); },
  get supportPhone() { return t('Teléfono de soporte', 'Support phone'); },
  get notificationsSection() { return t('Notificaciones', 'Notifications'); },
  get emailNotifications() { return t('Notificaciones por email', 'Email notifications'); },
  get pushNotifications() { return t('Notificaciones push', 'Push notifications'); },
  get whatsappNotifications() { return t('Notificaciones por WhatsApp', 'WhatsApp notifications'); },
  get securitySection() { return t('Seguridad', 'Security'); },
  get force2FA() { return t('Forzar 2FA para todos los administradores', 'Force 2FA for all administrators'); },
  get sessionExpiry() { return t('Tiempo de expiración de sesión', 'Session expiration time'); },
  get maxLoginAttempts() { return t('Intentos máximos de inicio de sesión', 'Maximum login attempts'); },
  get maintenanceSection() { return t('Mantenimiento', 'Maintenance'); },
  get maintenanceMode() { return t('Modo de mantenimiento', 'Maintenance mode'); },
  get maintenanceWarning() { return t('La plataforma está en modo mantenimiento. Los usuarios no podrán acceder a la aplicación.', 'The platform is in maintenance mode. Users will not be able to access the app.'); },

  // ── Image upload ───────────────────────────────────────────────────
  get imageLabel() { return t('Imagen', 'Image'); },
  get errorUploadingImage() { return t('Error al subir la imagen', 'Error uploading image'); },
  get changeImage() { return t('Cambiar imagen', 'Change image'); },
  get deleteImage() { return t('Eliminar imagen', 'Delete image'); },
  get uploadingImage() { return t('Subiendo y optimizando...', 'Uploading and optimizing...'); },
  get dragOrClick() { return t('Arrastra una imagen o haz clic', 'Drag an image or click'); },
  get imageFormats() { return t('JPG, PNG, WebP, GIF — Máx 10 MB', 'JPG, PNG, WebP, GIF — Max 10 MB'); },

  // ── Seating layout editor ──────────────────────────────────────────
  get seatTypeStandard() { return t('Estándar', 'Standard'); },
  get seatTypeVip() { return t('VIP', 'VIP'); },
  get seatTypePremium() { return t('Premium', 'Premium'); },
  get seatTypeAccessible() { return t('Accesible', 'Accessible'); },

  // ── Categories ─────────────────────────────────────────────────────
  get concerts() { return t('Conciertos', 'Concerts'); },
  get festivals() { return t('Festivales', 'Festivals'); },
  get nightlife() { return t('Vida Nocturna', 'Nightlife'); },
  get sports() { return t('Deportes', 'Sports'); },
  get conferences() { return t('Conferencias', 'Conferences'); },
  get gastronomy() { return t('Gastronomía', 'Gastronomy'); },
  get family() { return t('Familiar', 'Family'); },
  get theaterCategory() { return t('Teatro', 'Theater'); },
};
