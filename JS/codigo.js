/* ========================================================
   CineCali - Lógica de Programación (codigo.js)
   Guía de Desarrollo Web Interactivo (HTML, CSS y JavaScript)
   ======================================================== */

// --------------------------------------------------------
// 1. CONSTANTES Y VARIABLES GLOBALES
// --------------------------------------------------------
const TARIFA = 12000;                      // Tarifa base boleta: $12,000 COP
const USUARIO_VALIDO = 'Cinecali';         // Usuario autorizado
const PASSWORD_VALIDO = 'Estrenos';        // Contraseña autorizada
const CLAVE_SEGURIDAD = 'CINE';            // Clave para registro continuo
const PORCENTAJE_RECARGO = 0.05;           // 5% de recargo por horario
const HORA_INICIO_RECARGO = 15;            // 3:00 p.m. (15:00)
const HORA_FIN_RECARGO = 18;               // 6:00 p.m. (18:00)

// Arreglo para almacenar las recaudaciones calculadas
let recaudaciones = [];

// Arreglo con la información completa de cada función registrada
let historialFunciones = [];

// Estado del mapa de asientos
let asientos = {};
let asientoActualSeleccionado = 'A-1';
let asientoNuevoSeleccionado = 'B-4';

// Stream de la cámara web
let streamCamara = null;


// --------------------------------------------------------
// 2. INICIALIZACIÓN AL CARGAR LA PÁGINA
// --------------------------------------------------------
window.addEventListener('DOMContentLoaded', () => {
    iniciarRelojSistema();
    inicializarMapaAsientos();
    establecerHoraActual();
    dibujarGraficaLineas();
});


// --------------------------------------------------------
// 3. CONTROL DE SESIÓN (LOGIN Y LOGOUT)
// --------------------------------------------------------

/**
 * Valida las credenciales ingresadas.
 * Usuario: 'Cinecali' | Contraseña: 'Estrenos'
 */
function iniciarSesion() {
    // Captura de valores del DOM
    let usuarioInput = document.getElementById('usuario-login').value.trim();
    let passwordInput = document.getElementById('password-login').value;
    let mensajeError = document.getElementById('mensaje-login-error');

    // Validación de usuario y contraseña
    if (usuarioInput === USUARIO_VALIDO && passwordInput === PASSWORD_VALIDO) {
        // Ocultar mensaje de error si estaba visible
        mensajeError.classList.add('oculto');

        // Ocultar pantalla de login y mostrar panel principal
        let seccionLogin = document.getElementById('seccion-login');
        let seccionPrincipal = document.getElementById('seccion-principal');

        seccionLogin.classList.add('oculto');
        seccionPrincipal.classList.remove('oculto');

        // Limpiar campos de login
        document.getElementById('usuario-login').value = '';
        document.getElementById('password-login').value = '';

        // Redibujar la gráfica una vez el contenedor sea visible
        setTimeout(dibujarGraficaLineas, 100);

        alert('¡Bienvenido al sistema CineCali, Operador ' + USUARIO_VALIDO + '!');
    } else {
        // Credenciales incorrectas
        mensajeError.textContent = 'Usuario o contraseña incorrectos. Intente nuevamente.';
        mensajeError.classList.remove('oculto');
        alert('Acceso denegado: Usuario o contraseña incorrectos.');
    }
}

/**
 * Cierra la sesión activa y regresa al login.
 */
function cerrarSesion() {
    let seccionLogin = document.getElementById('seccion-login');
    let seccionPrincipal = document.getElementById('seccion-principal');

    // Detener la cámara si estaba encendida
    detenerStreamCamara();

    // Alternar visibilidad
    seccionPrincipal.classList.add('oculto');
    seccionLogin.classList.remove('oculto');
}


// --------------------------------------------------------
// 4. REGISTRO DE FUNCIONES Y CÁLCULOS DE TAQUILLA
// --------------------------------------------------------

/**
 * Procesa el cálculo de la taquilla, ejecuta la animación de reloj,
 * muestra el resultado y solicita la clave de seguridad 'CINE'.
 */
function procesarRecaudacion() {
    // Capturar valores del formulario desde el DOM
    let pelicula = document.getElementById('nombre-pelicula').value.trim();
    let sala = document.getElementById('sala-cine').value;
    let boletas = parseInt(document.getElementById('cantidad-boletas').value);
    let precio = parseFloat(document.getElementById('precio-boleta').value);

    // Validaciones básicas
    if (!pelicula || isNaN(boletas) || boletas <= 0 || isNaN(precio) || precio <= 0) {
        alert('Por favor ingrese datos válidos en todos los campos.');
        return;
    }

    // Cálculo aritmético: Recaudación Total = boletas * precio
    let recaudacionTotal = boletas * precio;

    // Referencias a los contenedores de animación y resultados
    let contenedorResultado = document.getElementById('contenedor-resultado-calculo');
    let animacionReloj = document.getElementById('animacion-reloj');
    let tarjetaResumen = document.getElementById('tarjeta-resumen-resultado');
    let contadorSegundos = document.getElementById('contador-segundos');
    let btnCalcular = document.getElementById('btn-calcular-taquilla');

    // Deshabilitar botón durante el proceso
    btnCalcular.disabled = true;

    // Mostrar el contenedor y activar el efecto tipo reloj
    contenedorResultado.classList.remove('oculto');
    tarjetaResumen.classList.add('oculto');
    animacionReloj.classList.remove('oculto');

    // Cuenta regresiva visual del efecto reloj (3 segundos)
    let tiempoRestante = 3.0;
    contadorSegundos.textContent = tiempoRestante.toFixed(1) + 's';

    let intervaloReloj = setInterval(() => {
        tiempoRestante -= 0.1;
        if (tiempoRestante <= 0) {
            tiempoRestante = 0;
            clearInterval(intervaloReloj);
        }
        contadorSegundos.textContent = tiempoRestante.toFixed(1) + 's';
    }, 100);

    // Al finalizar los 3 segundos de efecto reloj:
    setTimeout(() => {
        // Ocultar animación de reloj
        animacionReloj.classList.add('oculto');

        // Mostrar el resultado de la recaudación
        document.getElementById('res-recaudacion-total').innerHTML = formatearMoneda(recaudacionTotal);

        let fechaHoraActual = new Date();
        let horaRegistro = fechaHoraActual.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        document.getElementById('res-detalles-funcion').innerHTML = `
            <p><strong>Película:</strong> ${pelicula}</p>
            <p><strong>Sala:</strong> ${sala}</p>
            <p><strong>Boletas:</strong> ${boletas} unid.</p>
            <p><strong>Tarifa Boleta:</strong> ${formatearMoneda(precio)}</p>
            <p><strong>Hora:</strong> ${horaRegistro}</p>
            <p><strong>Operador:</strong> ${USUARIO_VALIDO}</p>
        `;

        tarjetaResumen.classList.remove('oculto');
        btnCalcular.disabled = false;

        // Guardar la recaudación en el arreglo global
        recaudaciones.push(recaudacionTotal);
        historialFunciones.push({
            pelicula: pelicula,
            sala: sala,
            boletas: boletas,
            precio: precio,
            total: recaudacionTotal,
            hora: horaRegistro
        });

        // Actualizar la gráfica de líneas y métricas estadísticas
        actualizarMetricas();
        dibujarGraficaLineas();

        // ----------------------------------------------------
        // REQUERIMIENTO 3: REGISTRO CONTINUO CON CLAVE 'CINE'
        // ----------------------------------------------------
        setTimeout(() => {
            solicitarClaveRegistroContinuo();
        }, 600);

    }, 3000);
}

/**
 * Solicita mediante una ventana emergente la palabra clave 'CINE'.
 * Si coincide, limpia los campos para registrar otra función.
 * Si es diferente, emite alerta y devuelve al usuario al login.
 */
function solicitarClaveRegistroContinuo() {
    let clave = prompt("Para registrar de forma continua otra función, ingrese la palabra clave ('CINE'):");

    if (clave === CLAVE_SEGURIDAD) {
        alert("Clave de seguridad 'CINE' confirmada con éxito. Puede registrar una nueva función.");
        limpiarCamposTaquilla();
    } else {
        alert("Palabra clave incorrecta o cancelada. El sistema lo devolverá automáticamente a la pantalla de inicio de sesión.");
        limpiarCamposTaquilla();
        cerrarSesion();
    }
}

/**
 * Limpia los campos del formulario de registro de función.
 */
function limpiarCamposTaquilla() {
    document.getElementById('nombre-pelicula').value = '';
    document.getElementById('cantidad-boletas').value = '';
    document.getElementById('precio-boleta').value = TARIFA;
    document.getElementById('nombre-pelicula').focus();
}


// --------------------------------------------------------
// 5. CAMBIO DE ASIENTOS CON RECARGO POR HORARIO
// --------------------------------------------------------

/**
 * Inicializa la matriz de asientos de la sala (Filas A a D, Asientos 1 a 8).
 */
function inicializarMapaAsientos() {
    const filas = ['A', 'B', 'C', 'D'];
    const totalColumnas = 8;
    const contenedorGrilla = document.getElementById('grilla-asientos');
    const selectActual = document.getElementById('asiento-actual');
    const selectNuevo = document.getElementById('asiento-nuevo');

    contenedorGrilla.innerHTML = '';
    selectActual.innerHTML = '';
    selectNuevo.innerHTML = '';

    asientos = {};

    filas.forEach((fila) => {
        for (let col = 1; col <= totalColumnas; col++) {
            let codigoAsiento = `${fila}-${col}`;
            
            // Asientos ocupados inicialmente de prueba
            let estaOcupado = (codigoAsiento === 'A-1' || codigoAsiento === 'A-3' || codigoAsiento === 'C-5');

            asientos[codigoAsiento] = {
                codigo: codigoAsiento,
                ocupado: estaOcupado
            };

            // Crear nodo en la grilla interactiva
            let asientoDiv = document.createElement('div');
            asientoDiv.id = `seat-${codigoAsiento}`;
            asientoDiv.className = `asiento-ui ${estaOcupado ? 'ocupado' : 'libre'}`;
            asientoDiv.textContent = codigoAsiento;
            asientoDiv.title = `Asiento ${codigoAsiento} (${estaOcupado ? 'Ocupado' : 'Libre'})`;

            asientoDiv.addEventListener('click', () => {
                seleccionarAsientoDesdeGrilla(codigoAsiento);
            });

            contenedorGrilla.appendChild(asientoDiv);

            // Poblar selects
            let optionActual = document.createElement('option');
            optionActual.value = codigoAsiento;
            optionActual.textContent = `${codigoAsiento} ${estaOcupado ? '(Ocupado)' : '(Libre)'}`;
            selectActual.appendChild(optionActual);

            let optionNuevo = document.createElement('option');
            optionNuevo.value = codigoAsiento;
            optionNuevo.textContent = `${codigoAsiento} ${estaOcupado ? '(Ocupado)' : '(Libre)'}`;
            selectNuevo.appendChild(optionNuevo);
        }
    });

    // Valores por defecto
    selectActual.value = 'A-1';
    selectNuevo.value = 'B-4';
    asientoActualSeleccionado = 'A-1';
    asientoNuevoSeleccionado = 'B-4';

    actualizarSeleccionAsientos();
}

/**
 * Permite seleccionar un asiento haciendo clic directamente en el mapa.
 */
function seleccionarAsientoDesdeGrilla(codigo) {
    let selectNuevo = document.getElementById('asiento-nuevo');
    selectNuevo.value = codigo;
    actualizarSeleccionAsientos();
}

/**
 * Refleja visualmente en la grilla los asientos origen y destino seleccionados.
 */
function actualizarSeleccionAsientos() {
    let actual = document.getElementById('asiento-actual').value;
    let nuevo = document.getElementById('asiento-nuevo').value;

    asientoActualSeleccionado = actual;
    asientoNuevoSeleccionado = nuevo;

    // Restaurar clases en la grilla
    Object.keys(asientos).forEach(codigo => {
        let el = document.getElementById(`seat-${codigo}`);
        if (!el) return;

        el.className = 'asiento-ui';

        if (codigo === nuevo) {
            el.classList.add('seleccionado');
        } else if (asientos[codigo].ocupado || codigo === actual) {
            el.classList.add('ocupado');
        } else {
            el.classList.add('libre');
        }
    });
}

/**
 * Ejecuta la transacción de cambio de asiento y aplica la regla de negocio:
 * Si la hora está entre las 3:00 p.m. (15:00) y las 6:00 p.m. (18:00),
 * se aplica un recargo automático del 5% sobre el valor base de la boleta ($12,000 COP).
 */
function ejecutarCambioAsiento() {
    let asientoOrigen = document.getElementById('asiento-actual').value;
    let asientoDestino = document.getElementById('asiento-nuevo').value;
    let horaInput = document.getElementById('hora-cambio').value;
    let contenedorResultado = document.getElementById('res-cambio-asiento');

    if (asientoOrigen === asientoDestino) {
        alert('El asiento nuevo debe ser diferente al asiento actual.');
        return;
    }

    if (!horaInput) {
        alert('Por favor especifique la hora de la operación.');
        return;
    }

    // Parsear la hora ingresada (formato HH:MM)
    let partesHora = horaInput.split(':');
    let horas = parseInt(partesHora[0]);
    let minutos = parseInt(partesHora[1]);

    // Convertir a valor decimal para comparar con precisión (ej: 15:30 -> 15.5)
    let horaDecimal = horas + (minutos / 60);

    // Regla de Negocio: Horario de 3:00 p.m. (15:00) a 6:00 p.m. (18:00)
    let aplicaRecargo = (horaDecimal >= HORA_INICIO_RECARGO && horaDecimal <= HORA_FIN_RECARGO);

    let valorRecargo = 0;
    let totalPagarCambio = 0;

    if (aplicaRecargo) {
        // 5% sobre el valor base de la boleta ($12,000 COP)
        valorRecargo = TARIFA * PORCENTAJE_RECARGO; // $600 COP
        totalPagarCambio = valorRecargo;
    } else {
        valorRecargo = 0;
        totalPagarCambio = 0;
    }

    // Actualizar estado del mapa de asientos
    asientos[asientoOrigen].ocupado = false;
    asientos[asientoDestino].ocupado = true;

    // Actualizar visualmente la grilla
    actualizarSeleccionAsientos();

    // Generar recibo de cambio de asiento
    contenedorResultado.className = 'resumen-cambio ' + (aplicaRecargo ? 'con-recargo' : 'sin-recargo');
    contenedorResultado.innerHTML = `
        <h4 style="color: ${aplicaRecargo ? 'var(--dorado)' : 'var(--verde-exito)'}; margin-bottom: 8px;">
            ${aplicaRecargo ? '⚠️ Cambio Realizado en Horario Pico (Con Recargo 5%)' : '✓ Cambio Realizado con Éxito (Sin Recargo)'}
        </h4>
        <div style="font-size: 0.85rem; line-height: 1.6;">
            <p><strong>Asiento Anterior:</strong> ${asientoOrigen}</p>
            <p><strong>Nuevo Asiento:</strong> ${asientoDestino}</p>
            <p><strong>Hora de la Operación:</strong> ${horaInput} (${horas >= 12 ? (horas === 12 ? 12 : horas - 12) + ':' + (minutos < 10 ? '0' : '') + minutos + ' p.m.' : horas + ':' + (minutos < 10 ? '0' : '') + minutos + ' a.m.'})</p>
            <p><strong>Tarifa Base Boleta:</strong> ${formatearMoneda(TARIFA)}</p>
            <p><strong>¿Aplica Recargo (15:00 a 18:00)?:</strong> <span style="font-weight: bold; color: ${aplicaRecargo ? '#f59e0b' : '#10b981'}">${aplicaRecargo ? 'SÍ (5% adicional = ' + formatearMoneda(valorRecargo) + ')' : 'NO (Sin costo adicional)'}</span></p>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid rgba(255,255,255,0.1);">
            <p style="font-size: 1rem;"><strong>Total a Pagar por el Cambio:</strong> <span style="color: var(--dorado); font-weight: 700;">${formatearMoneda(totalPagarCambio)}</span></p>
        </div>
    `;

    contenedorResultado.classList.remove('oculto');

    alert(`Cambio de asiento procesado:\n${asientoOrigen} -> ${asientoDestino}\nHora: ${horaInput}\n${aplicaRecargo ? 'Se aplicó recargo del 5% ($' + valorRecargo.toLocaleString('es-CO') + ' COP).' : 'Sin recargo adicional.'}`);
}

/**
 * Pone automáticamente en el input la hora del sistema en formato HH:MM.
 */
function establecerHoraActual() {
    let ahora = new Date();
    let horas = ahora.getHours().toString().padStart(2, '0');
    let minutos = ahora.getMinutes().toString().padStart(2, '0');
    let inputHora = document.getElementById('hora-cambio');
    if (inputHora) {
        inputHora.value = `${horas}:${minutos}`;
    }
}


// --------------------------------------------------------
// 6. GRÁFICA DE LÍNEAS DINÁMICA (HTML5 CANVAS)
// --------------------------------------------------------

/**
 * Dibuja dinámicamente en el elemento Canvas una gráfica de líneas
 * utilizando el arreglo global 'recaudaciones'.
 */
function dibujarGraficaLineas() {
    let canvas = document.getElementById('grafica-lineas');
    if (!canvas) return;

    let ctx = canvas.getContext('2d');
    let ancho = canvas.width;
    let alto = canvas.height;

    let mensajeVacio = document.getElementById('mensaje-sin-datos');

    // Limpiar canvas
    ctx.clearRect(0, 0, ancho, alto);

    if (recaudaciones.length === 0) {
        if (mensajeVacio) mensajeVacio.classList.remove('oculto');
        return;
    }

    if (mensajeVacio) mensajeVacio.classList.add('oculto');

    // Márgenes para ejes y etiquetas
    const padIzq = 65;
    const padDer = 30;
    const padArr = 30;
    const padAba = 40;

    let areaGraficaAncho = ancho - padIzq - padDer;
    let areaGraficaAlto = alto - padArr - padAba;

    // Obtener valor máximo para escalar
    let maxValor = Math.max(...recaudaciones);
    if (maxValor <= 0) maxValor = 100000;
    // Margen superior del 15%
    let escalaMax = maxValor * 1.15;

    // 1. Dibujar líneas de cuadrícula horizontales
    const niveles = 4;
    ctx.strokeStyle = '#223046';
    ctx.lineWidth = 1;
    ctx.font = '10px Montserrat, sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.textAlign = 'right';

    for (let i = 0; i <= niveles; i++) {
        let y = padArr + (areaGraficaAlto / niveles) * i;
        let valorNivel = escalaMax - (escalaMax / niveles) * i;

        ctx.beginPath();
        ctx.moveTo(padIzq, y);
        ctx.lineTo(ancho - padDer, y);
        ctx.stroke();

        ctx.fillText('$' + abreviarNumero(valorNivel), padIzq - 8, y + 4);
    }

    // 2. Calcular coordenadas (X, Y) para cada punto
    let puntos = [];
    let pasoX = recaudaciones.length > 1 ? areaGraficaAncho / (recaudaciones.length - 1) : areaGraficaAncho / 2;

    for (let i = 0; i < recaudaciones.length; i++) {
        let x = recaudaciones.length === 1 ? padIzq + areaGraficaAncho / 2 : padIzq + i * pasoX;
        let y = (padArr + areaGraficaAlto) - (recaudaciones[i] / escalaMax) * areaGraficaAlto;
        puntos.push({ x: x, y: y, valor: recaudaciones[i], funcion: historialFunciones[i] });
    }

    // 3. Dibujar área bajo la curva con gradiente
    let gradienteArea = ctx.createLinearGradient(0, padArr, 0, padArr + areaGraficaAlto);
    gradienteArea.addColorStop(0, 'rgba(56, 189, 248, 0.35)');
    gradienteArea.addColorStop(1, 'rgba(56, 189, 248, 0.0)');

    ctx.beginPath();
    ctx.moveTo(puntos[0].x, padArr + areaGraficaAlto);
    puntos.forEach(p => ctx.lineTo(p.x, p.y));
    ctx.lineTo(puntos[puntos.length - 1].x, padArr + areaGraficaAlto);
    ctx.closePath();
    ctx.fillStyle = gradienteArea;
    ctx.fill();

    // 4. Dibujar la línea principal continua
    ctx.beginPath();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    puntos.forEach((p, idx) => {
        if (idx === 0) {
            ctx.moveTo(p.x, p.y);
        } else {
            ctx.lineTo(p.x, p.y);
        }
    });
    ctx.stroke();

    // 5. Dibujar puntos de datos, círculos brillantes y etiquetas
    puntos.forEach((p, idx) => {
        // Punto exterior dorado
        ctx.beginPath();
        ctx.arc(p.x, p.y, 6, 0, Math.PI * 2);
        ctx.fillStyle = '#f5c518';
        ctx.fill();

        // Punto interior blanco
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();

        // Etiqueta de valor sobre el punto
        ctx.font = 'bold 10px Orbitron, sans-serif';
        ctx.fillStyle = '#f5c518';
        ctx.textAlign = 'center';
        ctx.fillText('$' + abreviarNumero(p.valor), p.x, p.y - 12);

        // Etiqueta del eje X (F1, F2, F3...)
        ctx.font = '10px Montserrat, sans-serif';
        ctx.fillStyle = '#94a3b8';
        ctx.fillText('F' + (idx + 1), p.x, alto - padAba + 18);
    });
}

/**
 * Actualiza las tarjetas numéricas con el total acumulado y promedio.
 */
function actualizarMetricas() {
    let totalAcumulado = recaudaciones.reduce((acc, curr) => acc + curr, 0);
    let totalFunciones = recaudaciones.length;
    let promedio = totalFunciones > 0 ? totalAcumulado / totalFunciones : 0;

    let elTotal = document.getElementById('total-acumulado-dinero');
    let elFunciones = document.getElementById('total-funciones-registradas');
    let elPromedio = document.getElementById('promedio-por-funcion');

    if (elTotal) elTotal.textContent = formatearMoneda(totalAcumulado);
    if (elFunciones) elFunciones.textContent = totalFunciones.toString();
    if (elPromedio) elPromedio.textContent = formatearMoneda(promedio);
}


// --------------------------------------------------------
// 7. COMPONENTE DE CÁMARA (FOTO DE CONTROL DEL OPERADOR)
// --------------------------------------------------------

/**
 * Activa la cámara web del dispositivo usando getUserMedia.
 */
function activarCamara() {
    let video = document.getElementById('video-camara');
    let placeholder = document.getElementById('placeholder-camara');
    let btnActivar = document.getElementById('btn-activar-camara');
    let btnCapturar = document.getElementById('btn-capturar-foto');
    let btnReiniciar = document.getElementById('btn-reiniciar-foto');
    let estadoMsg = document.getElementById('estado-camara-msg');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
            .then((stream) => {
                streamCamara = stream;
                video.srcObject = stream;
                video.classList.remove('oculto');
                placeholder.classList.add('oculto');

                btnActivar.classList.add('oculto');
                btnCapturar.classList.remove('oculto');
                btnReiniciar.classList.add('oculto');
                estadoMsg.textContent = '● Cámara en vivo activada';
                estadoMsg.style.color = 'var(--verde-exito)';
            })
            .catch((err) => {
                console.warn('No se pudo acceder a la cámara:', err);
                simularCapturaRespaldo('No se detectó cámara física o permiso denegado. Se activó modo respaldo simulado.');
            });
    } else {
        simularCapturaRespaldo('Su navegador no soporta captura de cámara directa. Modo respaldo activo.');
    }
}

/**
 * Captura el fotograma actual del video y lo plasma en el canvas.
 */
function capturarFoto() {
    let video = document.getElementById('video-camara');
    let canvas = document.getElementById('canvas-foto');
    let placeholder = document.getElementById('placeholder-camara');
    let btnCapturar = document.getElementById('btn-capturar-foto');
    let btnReiniciar = document.getElementById('btn-reiniciar-foto');
    let estadoMsg = document.getElementById('estado-camara-msg');

    let ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Agregar marca de agua institucional
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
    ctx.fillStyle = '#f5c518';
    ctx.font = '10px Orbitron, sans-serif';
    ctx.textAlign = 'left';

    let ahora = new Date();
    let fechaStr = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();
    ctx.fillText(`OPERADOR: ${USUARIO_VALIDO} | ${fechaStr}`, 8, canvas.height - 14);

    // Ocultar video y mostrar canvas con la foto congelada
    video.classList.add('oculto');
    placeholder.classList.add('oculto');
    canvas.classList.remove('oculto');

    btnCapturar.classList.add('oculto');
    btnReiniciar.classList.remove('oculto');

    estadoMsg.textContent = '✓ Foto de control registrada correctamente';
    estadoMsg.style.color = 'var(--verde-exito)';

    detenerStreamCamara();
}

/**
 * Permite tomar una nueva foto reactivando la cámara.
 */
function reiniciarCamara() {
    let canvas = document.getElementById('canvas-foto');
    canvas.classList.add('oculto');
    activarCamara();
}

/**
 * Detiene los tracks del stream para liberar la cámara web.
 */
function detenerStreamCamara() {
    if (streamCamara) {
        streamCamara.getTracks().forEach(track => track.stop());
        streamCamara = null;
    }
}

/**
 * Genera una foto simulada en el canvas cuando no hay cámara conectada.
 */
function simularCapturaRespaldo(mensaje) {
    let canvas = document.getElementById('canvas-foto');
    let placeholder = document.getElementById('placeholder-camara');
    let btnActivar = document.getElementById('btn-activar-camara');
    let btnReiniciar = document.getElementById('btn-reiniciar-foto');
    let estadoMsg = document.getElementById('estado-camara-msg');

    let ctx = canvas.getContext('2d');
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Dibujar silueta estilizada de operador
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.arc(160, 95, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(160, 210, 75, Math.PI, 0, false);
    ctx.fill();

    // Marca de agua
    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    ctx.fillRect(0, canvas.height - 35, canvas.width, 35);
    ctx.fillStyle = '#f5c518';
    ctx.font = '10px Orbitron, sans-serif';
    ctx.textAlign = 'left';

    let ahora = new Date();
    let fechaStr = ahora.toLocaleDateString() + ' ' + ahora.toLocaleTimeString();
    ctx.fillText(`OPERADOR: ${USUARIO_VALIDO} (Verificado) | ${fechaStr}`, 8, canvas.height - 14);

    placeholder.classList.add('oculto');
    canvas.classList.remove('oculto');

    btnActivar.classList.add('oculto');
    btnReiniciar.classList.remove('oculto');

    estadoMsg.textContent = mensaje;
    estadoMsg.style.color = 'var(--dorado)';
}


// --------------------------------------------------------
// 8. UTILIDADES Y FUNCIONES AUXILIARES
// --------------------------------------------------------

/**
 * Inicia el segundero del reloj digital en la barra superior.
 */
function iniciarRelojSistema() {
    function actualizarReloj() {
        let relojEl = document.getElementById('reloj-sistema');
        if (relojEl) {
            let ahora = new Date();
            relojEl.textContent = ahora.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        }
    }
    actualizarReloj();
    setInterval(actualizarReloj, 1000);
}

/**
 * Formatea un número en formato moneda colombiana ($ COP).
 */
function formatearMoneda(valor) {
    return '$' + Math.round(valor).toLocaleString('es-CO') + ' COP';
}

/**
 * Abreviación compacta para el eje de la gráfica ($12K, $1.5M, etc.).
 */
function abreviarNumero(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(0) + 'K';
    }
    return Math.round(num).toString();
}
