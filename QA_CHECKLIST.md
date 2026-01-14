# ✅ CHECKLIST DE QA - DE PUENTE

## 📋 CENÁRIOS DE TESTE OBRIGATÓRIOS

### 1. AUTENTICACIÓN Y PERMISOS

#### 1.1 Login y Registro
- [ ] Usuario puede registrarse con email/password
- [ ] Usuario recibe email de confirmación (si habilitado)
- [ ] Usuario puede hacer login
- [ ] Usuario no autenticado es redirigido a /login
- [ ] Session persiste después de refresh

#### 1.2 Permisos Member
- [ ] Member ve solo ausencias de equipos donde está active
- [ ] Member NO ve ausencias de equipos donde está inactive
- [ ] Member puede crear ausencia en equipo active
- [ ] Member NO puede crear ausencia en equipo inactive
- [ ] Member puede editar solo sus propias ausencias
- [ ] Member NO puede editar ausencias de otros
- [ ] Member puede eliminar solo sus propias ausencias
- [ ] Member NO puede eliminar ausencias de otros
- [ ] Member NO ve botón "Admin" en header

#### 1.3 Permisos Admin
- [ ] Admin ve todas las ausencias de todos los equipos
- [ ] Admin puede editar cualquier ausencia
- [ ] Admin puede eliminar cualquier ausencia
- [ ] Admin ve botón "Admin" en header
- [ ] Admin puede acceder a /admin/*

---

### 2. CREAR AUSENCIA

#### 2.1 Flujo Normal
- [ ] Click en "Marcar ausencia" abre modal
- [ ] Usuario con 1 equipo: dropdown oculto, equipo pre-seleccionado
- [ ] Usuario con múltiples equipos: dropdown visible
- [ ] Tipos de ausencia: 4 opciones (🌴 🛌 ✈️ 🤒)
- [ ] Click en tipo lo selecciona visualmente
- [ ] Fechas por defecto: hoy
- [ ] "Solo hoy": start=end=hoy
- [ ] "Toda la semana": start=lunes, end=viernes
- [ ] Campos requeridos: equipo, tipo, fechas
- [ ] Nota es opcional
- [ ] Click "Guardar y disfrutar" crea ausencia
- [ ] Modal se cierra después de guardar
- [ ] Calendario se actualiza automáticamente
- [ ] Ausencia aparece en el calendario

#### 2.2 Validaciones
- [ ] No permite start_date > end_date
- [ ] Muestra error si no selecciona equipo (múltiples equipos)
- [ ] Muestra error si falla al guardar
- [ ] No permite crear en equipo inactive

#### 2.3 Performance
- [ ] Flujo completo toma < 15 segundos
- [ ] Modal abre en < 200ms
- [ ] Guardar completa en < 1 segundo

---

### 3. EDITAR AUSENCIA

#### 3.1 Flujo Normal
- [ ] Click en evento abre modal de detalle
- [ ] Muestra información completa: persona, equipo, tipo, fechas, días, nota
- [ ] Usuario propietario ve botones "Editar" y "Eliminar"
- [ ] Admin ve botones "Editar" y "Eliminar" en cualquier ausencia
- [ ] Otros usuarios NO ven botones de acción
- [ ] Click "Editar" cambia a modo edición
- [ ] Puede cambiar: tipo, fechas, nota
- [ ] Puede cambiar equipo (si múltiples)
- [ ] Click "Guardar cambios" actualiza ausencia
- [ ] Modal se cierra
- [ ] Calendario se actualiza

#### 3.2 Ajustes Rápidos
- [ ] Botón "-1 día" mueve start y end -1 día
- [ ] Botón "+1 día" mueve start y end +1 día
- [ ] Botón "-7 días" mueve start y end -7 días
- [ ] Botón "+7 días" mueve start y end +7 días
- [ ] Ajustes respetan lógica de fechas válidas
- [ ] Cambios se reflejan inmediatamente en calendario

#### 3.3 Validaciones
- [ ] No permite start_date > end_date al editar
- [ ] Muestra error si falla al actualizar

---

### 4. ELIMINAR AUSENCIA

#### 4.1 Flujo Normal
- [ ] Click "Eliminar" muestra confirmación
- [ ] Confirmación con mensaje claro
- [ ] Click "Aceptar" elimina ausencia
- [ ] Modal se cierra
- [ ] Ausencia desaparece del calendario
- [ ] Click "Cancelar" no elimina

#### 4.2 Permisos
- [ ] Propietario puede eliminar su ausencia
- [ ] Admin puede eliminar cualquier ausencia
- [ ] Otros usuarios NO ven botón eliminar

---

### 5. CALENDARIO

#### 5.1 Visualización
- [ ] Vista por defecto: mes
- [ ] Puede cambiar a vista semana
- [ ] Eventos muestran: emoji + nombre
- [ ] Colores correctos por tipo:
  - 🌴 Vacaciones: Verde
  - 🛌 Día libre: Azul
  - ✈️ Viaje: Morado
  - 🤒 Baja médica: Rojo
  - 🎉 Festivo: Gris
- [ ] Eventos multi-día se muestran correctamente
- [ ] Festivos se distinguen visualmente
- [ ] Hoy se destaca con color de fondo

#### 5.2 Navegación
- [ ] Botones "Anterior" y "Siguiente" cambian mes/semana
- [ ] Botón "Hoy" vuelve a fecha actual
- [ ] Cambiar vista actualiza calendario correctamente
- [ ] Performance: cambio de mes < 500ms

#### 5.3 Interacción
- [ ] Click en ausencia abre modal detalle
- [ ] Click en festivo NO abre modal
- [ ] Hover en evento muestra cursor pointer

---

### 6. FILTRO POR EQUIPO

#### 6.1 Usuario con 1 Equipo
- [ ] No muestra selector de equipos
- [ ] Muestra solo ausencias de su equipo

#### 6.2 Usuario con Múltiples Equipos
- [ ] Muestra selector con: "Mis equipos" + cada equipo individual
- [ ] Por defecto: "Mis equipos" seleccionado
- [ ] Click en equipo individual filtra a ese equipo
- [ ] Click en "Mis equipos" muestra todos sus equipos
- [ ] Cambio de filtro actualiza calendario inmediatamente
- [ ] Filtro persiste al navegar calendario

#### 6.3 Admin
- [ ] Admin ve opción "Todos los equipos"
- [ ] Admin puede filtrar por equipo específico
- [ ] Admin ve todas las ausencias sin filtro

---

### 7. "HOY ESTÁN DE PUENTE"

#### 7.1 Visualización
- [ ] Card muestra ausencias activas hoy
- [ ] Formato: emoji + nombre + duración
- [ ] "solo hoy" para ausencias de 1 día
- [ ] "último día" si termina hoy
- [ ] "hasta [fecha]" si continúa
- [ ] No aparece si nadie está ausente hoy
- [ ] Se actualiza al crear/editar/eliminar ausencia

---

### 8. EXPORT A EXCEL

#### 8.1 Funcionalidad
- [ ] Click "Exportar a Excel" genera archivo
- [ ] Archivo se descarga automáticamente
- [ ] Filename: `ausencias_YYYY-MM-DD_YYYY-MM-DD.xlsx`
- [ ] Columnas correctas:
  - Usuario
  - Email
  - Equipo
  - Tipo
  - Fecha inicio
  - Fecha fin
  - Días laborables
  - Nota

#### 8.2 Datos
- [ ] Export incluye solo ausencias de equipos filtrados
- [ ] Export incluye solo ausencias en rango de fechas
- [ ] Días laborables calculados correctamente
- [ ] Tipos traducidos a español
- [ ] Fechas formateadas (dd/mm/yyyy)
- [ ] Resumen al final con total de días

#### 8.3 Performance
- [ ] Export de 10 registros < 1 segundo
- [ ] Export de 100 registros < 3 segundos
- [ ] Export de 1000 registros < 10 segundos

---

### 9. CÁLCULO DÍAS LABORABLES

#### 9.1 Casos de Prueba
- [ ] Lunes a Viernes = 5 días
- [ ] Lunes a Lunes (1 semana) = 5 días
- [ ] Viernes a Lunes = 2 días (viernes + lunes)
- [ ] Sábado a Domingo = 0 días
- [ ] Viernes a Domingo = 1 día (viernes)
- [ ] Solo 1 día laboral = 1 día
- [ ] Mes completo calcula correctamente

#### 9.2 Consistencia
- [ ] count_business_days SQL = cálculo frontend
- [ ] Vista absences_with_business_days correcta
- [ ] Export Excel usa mismo cálculo
- [ ] Resumen usa mismo cálculo

---

### 10. MULTI-EQUIPO

#### 10.1 Membresías
- [ ] Usuario puede estar en múltiples equipos
- [ ] Todos los equipos activos aparecen en dropdown
- [ ] Puede crear ausencia en cualquier equipo activo
- [ ] Ve ausencias de todos sus equipos activos

#### 10.2 Status Active/Inactive
- [ ] Usuario active ve ausencias del equipo
- [ ] Usuario inactive NO ve ausencias del equipo
- [ ] Usuario inactive NO puede crear ausencias en ese equipo
- [ ] Usuario inactive mantiene acceso a otros equipos activos
- [ ] Cambio a inactive es inmediato

---

### 11. FESTIVOS GESTAMP

#### 11.1 Visualización
- [ ] Festivos aparecen en calendario
- [ ] Color gris neutral
- [ ] Emoji 🎉 visible
- [ ] Título del festivo visible
- [ ] Click NO abre modal

#### 11.2 Gestión (Admin)
- [ ] Admin puede crear festivos
- [ ] Admin puede editar festivos
- [ ] Admin puede eliminar festivos
- [ ] Festivos scope: global
- [ ] Members NO pueden gestionar festivos

---

### 12. RESPONSIVE

#### 12.1 Desktop (> 1024px)
- [ ] Calendario ancho completo
- [ ] Todos los botones visibles
- [ ] Modal centrado
- [ ] Filtros en línea

#### 12.2 Tablet (768px - 1024px)
- [ ] Calendario ajustado
- [ ] Botones pueden wrap
- [ ] Modal responsive

#### 12.3 Mobile (< 768px)
- [ ] Vista semana por defecto (recomendado)
- [ ] Botones apilados verticalmente
- [ ] Modal full-screen
- [ ] Touch-friendly (botones > 44px)

---

### 13. EDGE CASES

#### 13.1 Datos Vacíos
- [ ] Sin ausencias: calendario vacío (no error)
- [ ] Sin equipos: mensaje apropiado
- [ ] Sin festivos: calendario sin festivos

#### 13.2 Fechas Límite
- [ ] Año bisiesto funciona correctamente
- [ ] Cambio de año funciona
- [ ] Ausencias muy largas (> 30 días) se muestran bien

#### 13.3 Concurrencia
- [ ] Dos usuarios crean ausencia simultáneamente
- [ ] Usuario edita mientras otro visualiza
- [ ] Admin elimina ausencia que member está editando

---

### 14. PERFORMANCE Y UX

#### 14.1 Tiempos de Respuesta
- [ ] Carga inicial < 2 segundos
- [ ] Crear ausencia < 1 segundo
- [ ] Editar ausencia < 1 segundo
- [ ] Eliminar ausencia < 500ms
- [ ] Cambiar filtro < 300ms
- [ ] Export Excel < 3 segundos

#### 14.2 Feedback Visual
- [ ] Loading states en botones
- [ ] Disabled states durante operaciones
- [ ] Mensajes de error claros
- [ ] Confirmaciones de éxito (opcional)

#### 14.3 UX
- [ ] No hay flash de contenido no autenticado
- [ ] Transiciones suaves
- [ ] Hover states en elementos interactivos
- [ ] Focus states para accesibilidad

---

### 15. SEGURIDAD

#### 15.1 RLS
- [ ] Member NO puede ver ausencias de equipos ajenos
- [ ] Member NO puede crear en equipos ajenos
- [ ] Member NO puede editar ausencias ajenas
- [ ] Member NO puede eliminar ausencias ajenas
- [ ] Inactive member pierde acceso inmediatamente

#### 15.2 Validaciones
- [ ] Inputs sanitizados (XSS)
- [ ] SQL injection protegido por Supabase
- [ ] CSRF tokens (Next.js automático)

---

### 16. ADMIN CONSOLE (PENDIENTE)

#### 16.1 Personas
- [ ] Listar todas las personas
- [ ] Invitar por email
- [ ] Cambiar rol (admin/member)
- [ ] Ver membresías por persona
- [ ] Dar de alta en equipo
- [ ] Dar de baja de equipo

#### 16.2 Equipos
- [ ] Listar equipos
- [ ] Crear equipo
- [ ] Editar nombre equipo
- [ ] Ver miembros por equipo
- [ ] Agregar miembro a equipo
- [ ] Remover miembro de equipo

#### 16.3 Festivos
- [ ] Listar festivos
- [ ] Crear festivo
- [ ] Editar festivo
- [ ] Eliminar festivo
- [ ] Validar fechas

---

## 🐛 BUGS CONOCIDOS

- [ ] (ninguno reportado)

---

## ✅ CRITERIOS DE ACEPTACIÓN

Para considerar el MVP listo para producción:

1. ✅ Todos los tests de "Funcionalidades Core" pasan
2. ✅ Todos los tests de "Permisos" pasan
3. ✅ Todos los tests de "Cálculo Días Laborables" pasan
4. ✅ Todos los tests de "Multi-Equipo" pasan
5. ✅ Performance cumple métricas definidas
6. ✅ RLS verificado manualmente
7. ✅ Export Excel funciona correctamente
8. ⏳ Admin Console implementado (puede ser fase 2)
9. ✅ Responsive funciona en mobile
10. ✅ Documentación completa (README)

---

**Última actualización**: Enero 2025  
**Versión**: 1.0.0
