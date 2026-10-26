import { useState } from 'react';

const campos = [
  { clave: 'ph', etiqueta: 'pH', ayuda: 'Nivel de acidez o alcalinidad', ejemplo: '7.0' },
  { clave: 'hardness', etiqueta: 'Dureza', ayuda: 'mg/L', ejemplo: '200' },
  { clave: 'tds', etiqueta: 'Sólidos disueltos (TDS)', ayuda: 'ppm', ejemplo: '20000' },
  { clave: 'chlorine', etiqueta: 'Cloraminas', ayuda: 'ppm', ejemplo: '7' },
  { clave: 'sulfate', etiqueta: 'Sulfatos', ayuda: 'mg/L', ejemplo: '330' },
  { clave: 'conductivity', etiqueta: 'Conductividad', ayuda: 'μS/cm', ejemplo: '420' },
  { clave: 'organic_carbon', etiqueta: 'Carbono orgánico', ayuda: 'ppm', ejemplo: '14' },
  { clave: 'trihalomethanes', etiqueta: 'Trihalometanos', ayuda: 'μg/L', ejemplo: '65' },
  { clave: 'turbidity', etiqueta: 'Turbidez', ayuda: 'NTU', ejemplo: '4' },
];

const valoresIniciales = Object.fromEntries(campos.map((campo) => [campo.clave, '']));
const baseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

function App() {
  const [valores, setValores] = useState(valoresIniciales);
  const [resultado, setResultado] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);

  function actualizar(clave, valor) {
    setValores((anterior) => ({ ...anterior, [clave]: valor }));
    setResultado(null);
    setError('');
  }

  async function predecir(evento) {
    evento.preventDefault();
    setError('');
    setResultado(null);
    if (!baseUrl) {
      setError('Falta configurar VITE_API_URL con la dirección del backend en Render.');
      return;
    }
    const payload = {};
    for (const campo of campos) {
      const texto = valores[campo.clave].trim();
      if (!texto || !Number.isFinite(Number(texto))) {
        setError(`Introduce un valor numérico válido para ${campo.etiqueta}.`);
        return;
      }
      payload[campo.clave] = Number(texto);
    }
    setCargando(true);
    try {
      const respuesta = await fetch(`${baseUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!respuesta.ok) throw new Error(`La API respondió con HTTP ${respuesta.status}.`);
      const datos = await respuesta.json();
      if (![0, 1].includes(datos.prediccion) || typeof datos.probabilidad_potable !== 'number') {
        throw new Error('La respuesta del modelo no tiene el formato esperado.');
      }
      setResultado(datos);
    } catch (e) {
      setError(`No fue posible consultar el modelo. ${e.message}`);
    } finally {
      setCargando(false);
    }
  }

  return (
    <main className="pagina">
      <header className="encabezado">
        <span className="etiqueta">Random Forest · Predicción</span>
        <h1>Potabilidad del agua</h1>
        <p>Ingresa las características de una muestra para consultar el modelo desplegado en Render.</p>
      </header>

      <section className="panel">
        <div className="panel-cabecera"><h2>Datos de la muestra</h2><span className="contador">9 parámetros</span></div>
        <p className="intro-form">Ingresa los valores medidos para realizar una predicción.</p>
        <form onSubmit={predecir}>
          <div className="seccion-titulo">Características del agua</div>
          <div className="cuadricula">
            {campos.map((campo) => (
              <label key={campo.clave} className="campo">
                <span>{campo.etiqueta}</span>
                <input
                  type="number"
                  step="any"
                  required
                  placeholder={`Ej. ${campo.ejemplo}`}
                  value={valores[campo.clave]}
                  onChange={(evento) => actualizar(campo.clave, evento.target.value)}
                />
                <small>{campo.ayuda}</small>
              </label>
            ))}
          </div>
          <div className="acciones">
            <button type="submit" disabled={cargando}>{cargando ? 'Consultando...' : 'Predecir potabilidad'}</button>
            <button type="button" className="secundario" onClick={() => { setValores(valoresIniciales); setResultado(null); setError(''); }}>Limpiar</button>
          </div>
        </form>
      </section>

      {error && <section className="mensaje error" role="alert">{error}</section>}
      {resultado && (
        <section className={`mensaje ${resultado.prediccion === 1 ? 'positivo' : 'negativo'}`} aria-live="polite">
          <div className="subtitulo">Resultado del modelo</div>
          <h2>{resultado.prediccion === 1 ? 'Agua clasificada como potable' : 'Agua clasificada como no potable'}</h2>
          <p>Probabilidad estimada de la clase potable: <strong>{(resultado.probabilidad_potable * 100).toFixed(2)}%</strong></p>
          <p className="nota">Predicción educativa: no sustituye un análisis de laboratorio ni certifica la seguridad del agua.</p>
        </section>
      )}
      <footer>Modelo de clasificación Random Forest · API FastAPI</footer>
    </main>
  );
}

export default App;
