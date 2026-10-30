# Sistema de Control de Taquilla - CineCali
**Parcial / Guía Práctica de Fundamentos Web (HTML, CSS y JavaScript)**

Aplicación web interactiva que simula el control de taquilla de un cine, aplicando autenticación segura, cálculos aritméticos, registro continuo con clave de validación, gráfica estadística y gestión de cambios de asientos con recargo por horario.

---

## 📁 Estructura del Proyecto

Siguiendo la arquitectura solicitada en el ejercicio:

```text
fundamentosWebsProyect/
├── CSS/
│   └── styles.css        # Hoja de estilos (Diseño cine, animaciones, responsive)
├── HTML/
│   └── index.html        # Interfaz de usuario (Estructura semántica HTML5)
├── JS/
│   └── codigo.js         # Lógica de programación, manipulación del DOM y eventos
├── index.html            # Acceso directo raíz
└── README.md             # Documentación técnica
```

---

## 📋 Requerimientos Implementados

### 1. Login de Acceso
- **Credenciales válidas:**
  - **Usuario:** `Cinecali`
  - **Contraseña:** `Estrenos`
- Oculta el login (`classList.add('oculto')`) y muestra el panel principal (`classList.remove('oculto')`) tras la validación exitosa.

### 2. Registro de Funciones y Cálculos de Taquilla
- Captura de datos:
  - Nombre de la película
  - Sala (IMAX, 3D, VIP, Standard)
  - Cantidad de boletas vendidas
  - Precio por boleta (Tarifa base `$12,000 COP`)
- **Fórmula de Recaudación Total:**  
  $$\text{Recaudación Total} = \text{Boletas} \times \text{Precio}$$
- **Efecto Tipo Reloj:** Antes de cargar el resultado final, se muestra una animación visual con reloj analógico rotando y cuenta regresiva de 3 segundos.

### 3. Registro Continuo con Clave de Seguridad (`'CINE'`)
- Al finalizar el cálculo y mostrar el total, se despliega una ventana de diálogo (`prompt`) solicitando la clave `'CINE'`.
- Si el usuario ingresa exactamente `'CINE'`, se limpian los campos para permitir el registro de una nueva función.
- Si la palabra es diferente o se cancela, se emite una alerta (`alert`) y el sistema regresa automáticamente a la pantalla de login.

### 4. Cambio de Asientos con Recargo por Horario
- Módulo interactivo con mapa visual de asientos de la sala (Filas A-D, Asientos 1-8).
- **Regla de negocio:** Si el cambio de asiento se realiza en el horario comprendido entre las **3:00 p.m. (15:00)** y las **6:00 p.m. (18:00)**:
  - Se aplica automáticamente un **5% de recargo** sobre el valor base de la boleta ($12,000 \times 5\% = \$600\text{ COP}$).
- Emisión de recibo dinámico detallando hora, asiento de origen, asiento nuevo, tarifa base y costo final.

### 5. Gráfica de Líneas y Captura de Foto
- **Gráfica Dinámica en HTML5 Canvas:** Almacena cada recaudación en un arreglo `recaudaciones = []` y traza dinámicamente una gráfica de líneas continua con área degradada, ejes, niveles y puntos de datos.
- **Captura de Foto de Control del Operador:** Componente visual con acceso a cámara web mediante la API `navigator.mediaDevices.getUserMedia`, permitiendo capturar y congelar la foto del operador con marca de agua y fecha/hora (con modo de respaldo simulado ante ausencia de cámara).

---

## 🚀 Cómo Ejecutar la Aplicación

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/samuelreinagiraldo/parcialfundamentosweb2.git
   ```
2. Abrir el archivo `HTML/index.html` (o `index.html` en la raíz) en cualquier navegador web moderno (Google Chrome, Edge, Firefox, Brave).
3. Ingresar con las credenciales:
   - **Usuario:** `Cinecali`
   - **Contraseña:** `Estrenos`
