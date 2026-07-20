export type Rol = 'admin' | 'empleado';

export interface Usuario {
  id: string;
  nombre: string;
  usuario: string;
  rol: Rol;
  activo?: boolean;
}

export interface TipoServicio {
  id: string;
  nombre: string;
  activo: boolean;
}

export interface Servicio {
  id: string;
  fecha: string;
  tipoServicioId: string;
  tipoNombre: string;
  monto: number;
  clienteNombre: string;
  clienteTelefono: string;
  usuarioId: string;
  usuarioNombre: string;
  creadoEn: string;
}

export interface DashboardData {
  fecha: string;
  mes: string;
  totalMes: number;
  totalDia: number;
  cantidadDia: number;
  topServicios: { nombre: string; cantidad: number }[];
}

export interface ApiOk<T> {
  ok: true;
  [key: string]: unknown;
  data?: T;
}

export interface ApiError {
  ok: false;
  error: string;
}
