/**
 * CajaBella — backend en Google Apps Script.
 * Este archivo se pega en el editor de Apps Script (Extensiones > Apps Script)
 * de tu Google Sheet. Ver docs/DESPLIEGUE.md para la guía paso a paso.
 */

var SHEET_USUARIOS = 'Usuarios';
var SHEET_SERVICIOS = 'Servicios';
var SHEET_TIPOS = 'TiposDeServicio';
var SHEET_SESIONES = 'Sesiones';

var SESION_HORAS_VALIDEZ = 45 * 24; // 45 días

// ---------------------------------------------------------------------------
// SETUP — correr UNA VEZ manualmente desde el editor (menú "Ejecutar" > setup)
// ---------------------------------------------------------------------------
function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  crearHojaSiNoExiste_(ss, SHEET_USUARIOS, ['id', 'nombre', 'usuario', 'passwordHash', 'salt', 'rol', 'activo', 'creadoEn']);
  crearHojaSiNoExiste_(ss, SHEET_SERVICIOS, ['id', 'fecha', 'tipoServicioId', 'monto', 'clienteNombre', 'clienteTelefono', 'usuarioId', 'creadoEn']);
  crearHojaSiNoExiste_(ss, SHEET_TIPOS, ['id', 'nombre', 'activo']);
  crearHojaSiNoExiste_(ss, SHEET_SESIONES, ['token', 'usuarioId', 'creadoEn', 'expiraEn']);

  var usuarios = getSheet_(SHEET_USUARIOS);
  if (usuarios.getLastRow() < 2) {
    var salt = Utilities.getUuid();
    usuarios.appendRow([
      Utilities.getUuid(),
      'Administrador',
      'admin',
      hashPassword_('cambiar123', salt),
      salt,
      'admin',
      true,
      new Date().toISOString(),
    ]);
  }

  var tipos = getSheet_(SHEET_TIPOS);
  if (tipos.getLastRow() < 2) {
    ['Corte', 'Manicure', 'Tinte', 'Peinado', 'Depilación'].forEach(function (nombre) {
      tipos.appendRow([Utilities.getUuid(), nombre, true]);
    });
  }

  Logger.log('Listo. Usuario admin: "admin" / contraseña: "cambiar123" (cámbiala luego desde la app).');
}

function crearHojaSiNoExiste_(ss, nombre, headers) {
  var hoja = ss.getSheetByName(nombre);
  if (!hoja) {
    hoja = ss.insertSheet(nombre);
    hoja.appendRow(headers);
    hoja.setFrozenRows(1);
  }
  return hoja;
}

// ---------------------------------------------------------------------------
// ENTRADAS HTTP
// ---------------------------------------------------------------------------
function doGet(e) {
  try {
    var action = e.parameter.action;
    if (action === 'servicios') return json_(listarServicios_(requireAuth_(e.parameter.token), e.parameter.desde, e.parameter.hasta));
    if (action === 'tiposServicio') return json_(listarTipos_(requireAuth_(e.parameter.token)));
    if (action === 'tiposServicioTodos') return json_(listarTiposTodos_(requireAdmin_(e.parameter.token)));
    if (action === 'dashboard') return json_(dashboard_(requireAuth_(e.parameter.token), e.parameter.fecha));
    if (action === 'usuarios') return json_(listarUsuarios_(requireAuth_(e.parameter.token)));
    if (action === 'yo') return json_({ ok: true, usuario: sinDatosSensibles_(requireAuth_(e.parameter.token)) });
    return json_({ ok: false, error: 'Acción no reconocida' });
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

function doPost(e) {
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === 'login') return json_(login_(body.usuario, body.password));
    if (action === 'crearServicio') return json_(crearServicio_(requireAuth_(body.token), body));
    if (action === 'actualizarServicio') return json_(actualizarServicio_(requireAuth_(body.token), body));
    if (action === 'eliminarServicio') return json_(eliminarServicio_(requireAuth_(body.token), body));
    if (action === 'crearTipoServicio') return json_(crearTipo_(requireAdmin_(body.token), body.nombre));
    if (action === 'actualizarTipoServicio') return json_(actualizarTipo_(requireAdmin_(body.token), body));
    if (action === 'crearUsuario') return json_(crearUsuario_(requireAdmin_(body.token), body));
    if (action === 'actualizarUsuario') return json_(actualizarUsuario_(requireAdmin_(body.token), body));
    if (action === 'cambiarPassword') return json_(cambiarPassword_(requireAuth_(body.token), body));

    return json_({ ok: false, error: 'Acción no reconocida' });
  } catch (err) {
    return json_({ ok: false, error: err.message });
  }
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// AUTENTICACIÓN
// ---------------------------------------------------------------------------
function hashPassword_(password, salt) {
  var digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, password + ':' + salt);
  return digest.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function login_(usuario, password) {
  if (!usuario || !password) return { ok: false, error: 'Usuario o contraseña incorrectos' };
  var fila = buscarFila_(SHEET_USUARIOS, 'usuario', usuario);
  if (!fila || fila.activo === false) return { ok: false, error: 'Usuario o contraseña incorrectos' };
  var hash = hashPassword_(password, fila.salt);
  if (hash !== fila.passwordHash) return { ok: false, error: 'Usuario o contraseña incorrectos' };

  var token = Utilities.getUuid();
  var ahora = new Date();
  var expira = new Date(ahora.getTime() + SESION_HORAS_VALIDEZ * 60 * 60 * 1000);
  getSheet_(SHEET_SESIONES).appendRow([token, fila.id, ahora.toISOString(), expira.toISOString()]);

  return { ok: true, token: token, usuario: sinDatosSensibles_(fila) };
}

function requireAuth_(token) {
  if (!token) throw new Error('Sesión inválida, vuelve a iniciar sesión');
  var sesion = buscarFila_(SHEET_SESIONES, 'token', token);
  if (!sesion) throw new Error('Sesión inválida, vuelve a iniciar sesión');
  if (new Date(sesion.expiraEn).getTime() < Date.now()) throw new Error('Tu sesión expiró, vuelve a iniciar sesión');
  var usuario = buscarFila_(SHEET_USUARIOS, 'id', sesion.usuarioId);
  if (!usuario || usuario.activo === false) throw new Error('Tu cuenta ya no tiene acceso');
  return usuario;
}

function requireAdmin_(token) {
  var usuario = requireAuth_(token);
  if (usuario.rol !== 'admin') throw new Error('Solo un administrador puede hacer esto');
  return usuario;
}

function sinDatosSensibles_(usuario) {
  return { id: usuario.id, nombre: usuario.nombre, usuario: usuario.usuario, rol: usuario.rol };
}

function cambiarPassword_(usuarioAutenticado, body) {
  if (!body.passwordActual || !body.passwordNuevo) return { ok: false, error: 'Falta la contraseña actual o la nueva' };
  if (body.passwordNuevo.length < 6) return { ok: false, error: 'La contraseña nueva debe tener al menos 6 caracteres' };
  var hoja = getSheet_(SHEET_USUARIOS);
  var fila = ubicarFila_(hoja, 'id', usuarioAutenticado.id);
  if (hashPassword_(body.passwordActual, fila.salt) !== fila.passwordHash) {
    return { ok: false, error: 'Tu contraseña actual no es correcta' };
  }
  var nuevoSalt = Utilities.getUuid();
  hoja.getRange(fila.rowIndex, 4).setValue(hashPassword_(body.passwordNuevo, nuevoSalt));
  hoja.getRange(fila.rowIndex, 5).setValue(nuevoSalt);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// SERVICIOS
// ---------------------------------------------------------------------------
function crearServicio_(usuarioAutenticado, body) {
  var monto = Number(body.monto);
  if (!body.fecha || !body.tipoServicioId || !monto || monto <= 0) {
    return { ok: false, error: 'Falta la fecha, el tipo de servicio o el monto' };
  }
  var fila = {
    id: Utilities.getUuid(),
    fecha: body.fecha,
    tipoServicioId: body.tipoServicioId,
    monto: monto,
    clienteNombre: body.clienteNombre || '',
    clienteTelefono: body.clienteTelefono || '',
    usuarioId: usuarioAutenticado.id,
    creadoEn: new Date().toISOString(),
  };
  getSheet_(SHEET_SERVICIOS).appendRow([fila.id, fila.fecha, fila.tipoServicioId, fila.monto, fila.clienteNombre, fila.clienteTelefono, fila.usuarioId, fila.creadoEn]);
  return { ok: true, servicio: fila };
}

function listarServicios_(usuarioAutenticado, desde, hasta) {
  var filas = obtenerFilas_(SHEET_SERVICIOS);
  if (desde) filas = filas.filter(function (f) { return f.fecha >= desde; });
  if (hasta) filas = filas.filter(function (f) { return f.fecha <= hasta; });
  filas.sort(function (a, b) { return b.fecha.localeCompare(a.fecha) || b.creadoEn.localeCompare(a.creadoEn); });

  var nombrePorTipoId = {};
  obtenerFilas_(SHEET_TIPOS).forEach(function (t) { nombrePorTipoId[t.id] = t.nombre; });
  var nombrePorUsuarioId = {};
  obtenerFilas_(SHEET_USUARIOS).forEach(function (u) { nombrePorUsuarioId[u.id] = u.nombre; });

  var conNombres = filas.map(function (f) {
    return {
      id: f.id,
      fecha: f.fecha,
      tipoServicioId: f.tipoServicioId,
      tipoNombre: nombrePorTipoId[f.tipoServicioId] || 'Otro',
      monto: f.monto,
      clienteNombre: f.clienteNombre,
      clienteTelefono: f.clienteTelefono,
      usuarioId: f.usuarioId,
      usuarioNombre: nombrePorUsuarioId[f.usuarioId] || '—',
      creadoEn: f.creadoEn,
    };
  });

  return { ok: true, servicios: conNombres };
}

function actualizarServicio_(usuarioAutenticado, body) {
  var hoja = getSheet_(SHEET_SERVICIOS);
  var fila = ubicarFila_(hoja, 'id', body.id);
  if (!fila) return { ok: false, error: 'No se encontró el servicio' };
  if (fila.usuarioId !== usuarioAutenticado.id && usuarioAutenticado.rol !== 'admin') {
    return { ok: false, error: 'Solo quien registró este servicio (o un administrador) puede editarlo' };
  }
  if (typeof body.fecha === 'string' && body.fecha) hoja.getRange(fila.rowIndex, 2).setValue(body.fecha);
  if (typeof body.tipoServicioId === 'string' && body.tipoServicioId) hoja.getRange(fila.rowIndex, 3).setValue(body.tipoServicioId);
  if (body.monto !== undefined) {
    var monto = Number(body.monto);
    if (!monto || monto <= 0) return { ok: false, error: 'El monto no es válido' };
    hoja.getRange(fila.rowIndex, 4).setValue(monto);
  }
  if (typeof body.clienteNombre === 'string') hoja.getRange(fila.rowIndex, 5).setValue(body.clienteNombre);
  if (typeof body.clienteTelefono === 'string') hoja.getRange(fila.rowIndex, 6).setValue(body.clienteTelefono);
  return { ok: true };
}

function eliminarServicio_(usuarioAutenticado, body) {
  var hoja = getSheet_(SHEET_SERVICIOS);
  var fila = ubicarFila_(hoja, 'id', body.id);
  if (!fila) return { ok: false, error: 'No se encontró el servicio' };
  if (fila.usuarioId !== usuarioAutenticado.id && usuarioAutenticado.rol !== 'admin') {
    return { ok: false, error: 'Solo quien registró este servicio (o un administrador) puede borrarlo' };
  }
  hoja.deleteRow(fila.rowIndex);
  return { ok: true };
}

// ---------------------------------------------------------------------------
// TIPOS DE SERVICIO
// ---------------------------------------------------------------------------
function crearTipo_(usuarioAdmin, nombre) {
  if (!nombre || !nombre.trim()) return { ok: false, error: 'El nombre no puede estar vacío' };
  var id = Utilities.getUuid();
  getSheet_(SHEET_TIPOS).appendRow([id, nombre.trim(), true]);
  return { ok: true, tipo: { id: id, nombre: nombre.trim(), activo: true } };
}

function actualizarTipo_(usuarioAdmin, body) {
  var hoja = getSheet_(SHEET_TIPOS);
  var fila = ubicarFila_(hoja, 'id', body.id);
  if (!fila) return { ok: false, error: 'No se encontró el tipo de servicio' };
  if (typeof body.nombre === 'string' && body.nombre.trim()) hoja.getRange(fila.rowIndex, 2).setValue(body.nombre.trim());
  if (typeof body.activo === 'boolean') hoja.getRange(fila.rowIndex, 3).setValue(body.activo);
  return { ok: true };
}

function listarTipos_(usuarioAutenticado) {
  var filas = obtenerFilas_(SHEET_TIPOS).filter(function (f) { return f.activo !== false; });
  return { ok: true, tipos: filas };
}

// A diferencia de listarTipos_, esta incluye los inactivos: la usa la pantalla de
// Ajustes para que el admin pueda volver a activar un tipo que desactivó antes.
function listarTiposTodos_(usuarioAdmin) {
  var filas = obtenerFilas_(SHEET_TIPOS);
  return { ok: true, tipos: filas };
}

// ---------------------------------------------------------------------------
// USUARIOS (solo admin)
// ---------------------------------------------------------------------------
function crearUsuario_(usuarioAdmin, body) {
  if (!body.nombre || !body.usuario || !body.password) return { ok: false, error: 'Faltan datos del usuario' };
  if (buscarFila_(SHEET_USUARIOS, 'usuario', body.usuario)) return { ok: false, error: 'Ese usuario ya existe' };
  var salt = Utilities.getUuid();
  var fila = {
    id: Utilities.getUuid(),
    nombre: body.nombre,
    usuario: body.usuario,
    passwordHash: hashPassword_(body.password, salt),
    salt: salt,
    rol: body.rol === 'admin' ? 'admin' : 'empleado',
    activo: true,
    creadoEn: new Date().toISOString(),
  };
  getSheet_(SHEET_USUARIOS).appendRow([fila.id, fila.nombre, fila.usuario, fila.passwordHash, fila.salt, fila.rol, fila.activo, fila.creadoEn]);
  return { ok: true, usuario: sinDatosSensibles_(fila) };
}

function actualizarUsuario_(usuarioAdmin, body) {
  var hoja = getSheet_(SHEET_USUARIOS);
  var fila = ubicarFila_(hoja, 'id', body.id);
  if (!fila) return { ok: false, error: 'No se encontró el usuario' };
  if (typeof body.activo === 'boolean') hoja.getRange(fila.rowIndex, 7).setValue(body.activo);
  if (typeof body.nombre === 'string' && body.nombre.trim()) hoja.getRange(fila.rowIndex, 2).setValue(body.nombre.trim());
  if (typeof body.nuevaPassword === 'string' && body.nuevaPassword.length >= 6) {
    var salt = Utilities.getUuid();
    hoja.getRange(fila.rowIndex, 4).setValue(hashPassword_(body.nuevaPassword, salt));
    hoja.getRange(fila.rowIndex, 5).setValue(salt);
  }
  return { ok: true };
}

function listarUsuarios_(usuarioAutenticado) {
  var filas = obtenerFilas_(SHEET_USUARIOS).map(sinDatosSensibles_);
  return { ok: true, usuarios: filas };
}

// ---------------------------------------------------------------------------
// DASHBOARD
// ---------------------------------------------------------------------------
function dashboard_(usuarioAutenticado, fecha) {
  var hoy = fecha || Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
  var mes = hoy.substring(0, 7); // "yyyy-MM" del día que se está viendo
  var servicios = obtenerFilas_(SHEET_SERVICIOS);
  var tipos = obtenerFilas_(SHEET_TIPOS);
  var nombrePorTipoId = {};
  tipos.forEach(function (t) { nombrePorTipoId[t.id] = t.nombre; });

  var totalMes = 0;
  var totalDia = 0;
  var cantidadDia = 0;
  var conteoPorTipo = {};

  servicios.forEach(function (s) {
    if (s.fecha.substring(0, 7) === mes) totalMes += Number(s.monto) || 0;
    if (s.fecha === hoy) {
      totalDia += Number(s.monto) || 0;
      cantidadDia += 1;
    }
    conteoPorTipo[s.tipoServicioId] = (conteoPorTipo[s.tipoServicioId] || 0) + 1;
  });

  var topServicios = Object.keys(conteoPorTipo)
    .map(function (tipoId) { return { nombre: nombrePorTipoId[tipoId] || 'Otro', cantidad: conteoPorTipo[tipoId] }; })
    .sort(function (a, b) { return b.cantidad - a.cantidad; })
    .slice(0, 2);

  return { ok: true, fecha: hoy, mes: mes, totalMes: totalMes, totalDia: totalDia, cantidadDia: cantidadDia, topServicios: topServicios };
}

// ---------------------------------------------------------------------------
// UTILIDADES DE HOJAS
// ---------------------------------------------------------------------------
function getSheet_(nombre) {
  var hoja = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(nombre);
  if (!hoja) throw new Error('Falta correr setup() primero (hoja "' + nombre + '" no existe)');
  return hoja;
}

function obtenerFilas_(nombreHoja) {
  var hoja = getSheet_(nombreHoja);
  var valores = hoja.getDataRange().getValues();
  var headers = valores[0];
  var filas = [];
  for (var i = 1; i < valores.length; i++) {
    var fila = {};
    headers.forEach(function (h, idx) { fila[h] = normalizarCelda_(h, valores[i][idx]); });
    fila.__rowIndex = i + 1;
    filas.push(fila);
  }
  return filas;
}

// Google Sheets auto-convierte texto con forma de fecha ("2026-07-14") en un valor
// de fecha interno. Si no se normaliza de vuelta a texto plano, comparar fechas como
// string (ej. dashboard_) falla silenciosamente. Cualquier otra celda que Sheets haya
// interpretado como fecha se devuelve como ISO completo, por las dudas.
function normalizarCelda_(header, valor) {
  if (Object.prototype.toString.call(valor) !== '[object Date]') return valor;
  if (header === 'fecha') return Utilities.formatDate(valor, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  return valor.toISOString();
}

function buscarFila_(nombreHoja, campo, valor) {
  var filas = obtenerFilas_(nombreHoja);
  for (var i = 0; i < filas.length; i++) {
    if (String(filas[i][campo]) === String(valor)) return filas[i];
  }
  return null;
}

function ubicarFila_(hoja, campo, valor) {
  var headers = hoja.getDataRange().getValues()[0];
  var col = headers.indexOf(campo);
  var valores = hoja.getDataRange().getValues();
  for (var i = 1; i < valores.length; i++) {
    if (String(valores[i][col]) === String(valor)) {
      var fila = {};
      headers.forEach(function (h, idx) { fila[h] = normalizarCelda_(h, valores[i][idx]); });
      fila.rowIndex = i + 1;
      return fila;
    }
  }
  return null;
}
