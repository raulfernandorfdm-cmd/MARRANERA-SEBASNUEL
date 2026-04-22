export const firebaseConfig = {
  apiKey: "AIzaSyAdVUpbYBkvtszo9w4MAZzS9Wic6q7bHSY",
  authDomain: "marranera-sebasnuel-65436.firebaseapp.com",
  projectId: "marranera-sebasnuel-65436",
  storageBucket: "marranera-sebasnuel-65436.firebasestorage.app",
  messagingSenderId: "742886921969",
  appId: "1:742886921969:web:fc94ca3bf4aef606c33b50",
};

const apiKey = firebaseConfig.apiKey;
const projectId = firebaseConfig.projectId;

export const firebaseReady = Boolean(apiKey && projectId);

const baseUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents`;

const toFsValue = (value) => {
  if (value === null || value === undefined) return { nullValue: null };
  if (typeof value === "string") return { stringValue: value };
  if (typeof value === "boolean") return { booleanValue: value };
  if (typeof value === "number") return Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
  if (Array.isArray(value)) return { arrayValue: { values: value.map(toFsValue) } };
  if (typeof value === "object") {
    return {
      mapValue: {
        fields: Object.fromEntries(Object.entries(value).map(([k, v]) => [k, toFsValue(v)])),
      },
    };
  }
  return { stringValue: String(value) };
};

const fromFsValue = (node) => {
  if (!node) return null;
  if (node.stringValue !== undefined) return node.stringValue;
  if (node.integerValue !== undefined) return Number(node.integerValue);
  if (node.doubleValue !== undefined) return Number(node.doubleValue);
  if (node.booleanValue !== undefined) return Boolean(node.booleanValue);
  if (node.timestampValue !== undefined) return node.timestampValue;
  if (node.nullValue !== undefined) return null;
  if (node.arrayValue) return (node.arrayValue.values || []).map(fromFsValue);
  if (node.mapValue) {
    return Object.fromEntries(Object.entries(node.mapValue.fields || {}).map(([k, v]) => [k, fromFsValue(v)]));
  }
  return null;
};

const fromFsDoc = (doc) => ({
  id: doc.name.split("/").pop(),
  ...Object.fromEntries(Object.entries(doc.fields || {}).map(([k, v]) => [k, fromFsValue(v)])),
  _updateTime: doc.updateTime,
});

export const listCollection = async (name) => {
  const res = await fetch(`${baseUrl}/${name}?key=${apiKey}`);
  if (!res.ok) throw new Error(`Error listando ${name}`);
  const data = await res.json();
  return (data.documents || []).map(fromFsDoc);
};

export const createDocument = async (name, payload) => {
  const fields = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, toFsValue(v)]));
  const res = await fetch(`${baseUrl}/${name}?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Error creando documento en ${name}`);
  return fromFsDoc(await res.json());
};

export const patchDocument = async (name, id, payload) => {
  const fields = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, toFsValue(v)]));
  const res = await fetch(`${baseUrl}/${name}/${id}?key=${apiKey}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) throw new Error(`Error actualizando documento ${id}`);
  return fromFsDoc(await res.json());
};
