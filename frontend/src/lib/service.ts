import { clientGatewayBaseUrl, gatewayBaseUrl } from "./config";

export type Patient = {
  id: number;
  name: string;
  dateOfBirth?: string;
  medicalHistory?: string;
};

export type Doctor = {
  id: number;
  name: string;
  specialty: string;
  email: string;
  phone?: string;
};

export type Staff = {
  id: number;
  name: string;
  role: string;
  department?: string;
  email: string;
  phone?: string;
};

export type Room = {
  id: number;
  roomNumber: string;
  wing: string;
  status: string;
  assignedPatient?: string | null;
};

export type ServiceResult<T> = {
  items: T[];
  ok: boolean;
  authRequired?: boolean;
};

const patientBaseUrl = gatewayBaseUrl;
const doctorBaseUrl = gatewayBaseUrl;
const staffBaseUrl = gatewayBaseUrl;

export const serviceUrls = {
  patientBaseUrl,
  doctorBaseUrl,
  staffBaseUrl,
};

export const clientServiceUrls = {
  patientBaseUrl: clientGatewayBaseUrl,
  doctorBaseUrl: clientGatewayBaseUrl,
  staffBaseUrl: clientGatewayBaseUrl,
};

export async function fetchList<T>(
  baseUrl: string,
  path: string,
): Promise<ServiceResult<T>> {
  try {
    const response = await fetch(`${baseUrl}${path}`, { cache: "no-store" });
    if (response.status === 401 || response.status === 403) {
      return { items: [], ok: true, authRequired: true };
    }
    if (!response.ok) {
      return { items: [], ok: false };
    }
    const data = await response.json();
    return {
      items: Array.isArray(data) ? data : [],
      ok: true,
    };
  } catch {
    return { items: [], ok: false };
  }
}
