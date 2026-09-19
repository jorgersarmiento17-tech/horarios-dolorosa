// APLICACIÓN WEB DE HORARIOS - UEF LA DOLOROSA
// Versión Estable Blindada para Ejecución Local y Web Directa
// Elaborado en colaboración con el Coordinador Jorge Sarmiento Zumba

let perfilActual = 'docentes'; 
const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

// 1. MOTOR DE LOGÍSTICA HORARIA INSTITUCIONAL (REGLAS DE TIMBRES)
function obtenerRangoHorario(numeroHora, cursoPertenece, formatoDocente = false) {
    const hora = parseInt(numeroHora);
    
    if (hora === 1) return "07:00 - 07:45";
    if (hora === 2) return "07:45 - 08:30";
    if (hora === 3) return "08:30 - 09:15";
    if (hora === 4) return "09:15 - 10:00";

    if (formatoDocente) {
        if (hora === 5) return "EGB: 10:25-11:10\nBach: 10:25-11:05";
        if (hora === 6) return "EGB: 11:10-11:55\nBach: 11:05-11:45";
        if (hora === 7) return "EGB: 11:55-12:40\nBach: 11:45-12:25";
        if (hora === 8) return "EGB: 12:40-13:25\nBach: 12:25-13:05";
        if (hora === 9) return "EGB: 13:25-14:10\nBach: 13:05-13:45";
    }

    const esBachillerato = /bachillerato|primero|segundo|tercero|ciencias|técnico|tecnico/i.test(cursoPertenece);

    if (esBachillerato) {
        if (hora === 5) return "10:25 - 11:05";
        if (hora === 6) return "11:05 - 11:45";
        if (hora === 7) return "11:45 - 12:25";
        if (hora === 8) return "12:25 - 13:05";
        if (hora === 9) return "13:05 - 13:45";
    } else {
        if (hora === 5) return "10:25 - 11:10";
        if (hora === 6) return "11:10 - 11:55";
        if (hora === 7) return "11:55 - 12:40";
        if (hora === 8) return "12:40 - 13:25";
        if (hora === 9) return "13:25 - 14:10";
    }
    return "";
}

// 2. ORDENAMIENTO JERÁRQUICO ESTRICTO INSTITUCIONAL DE CURSOS
function obtenerPesoCurso(curso) {
    const c = curso.toLowerCase();
    if (c.includes('octavo')) return 10;
    if (c.includes('noveno')) return 20;
    if (c.includes('décimo') || c.includes('decimo')) return 30;
    if (c.includes('primero')) return 40;
    if (c.includes('segundo')) return 50;
    if (c.includes('tercero')) return 60;
    return 100;
}

// 3. INICIALIZADOR SEGURO
window.onload = function() {
    if (typeof DATA_HORARIOS === 'undefined') {
        alert("⚠️ Error crítico: No se puede acceder a la base de datos. Verifica que 'data.js' exista en la misma carpeta.");
        return;
    }
    cambiarPerfil('docentes');
};

// 4. CONTROLADOR DE CAMBIO DE PESTAÑA (CSS NATIVO)
function cambiarPerfil(perfil) {
    perfilActual = perfil;
    const btnD = document.getElementById('btnDocentes');
    const btnC = document.getElementById('btnCursos');
    const titulo = document.getElementById('tituloFiltro');

    if (perfil === 'docentes') {
        btnD.className = "btn-tab btn-activo";
        btnC.className = "btn-tab btn-inactivo";
        titulo.innerText = "Seleccione un Docente";
        cargarListaDocentes();
    } else {
        btnD.className = "btn-tab btn-inactivo";
        btnC.className = "btn-tab btn-activo";
        titulo.innerText = "Seleccione un Curso / Paralelo";
        cargarListaCursos();
    }
}

// 5. CARGAR DOCENTES (ALFABÉTICO)
function cargarListaDocentes() {
    const profesores = [...new Set(DATA_HORARIOS.map(item => item.Profesor))].sort((a, b) => a.localeCompare(b));
    const selector = document.getElementById('selectorPrincipal');
    selector.innerHTML = '<option value="">-- Seleccione un Profesor --</option>' + 
        profesores.map(p => `<option value="${p}">${p}</option>`).join('');
    limpiarContenedor();
}

// 6. CARGAR CURSOS (JERÁRQUICO)
function cargarListaCursos() {
    const cursos = [...new Set(DATA_HORARIOS.map(item => item.Curso))].sort((a, b) => {
        const pesoA = obtenerPesoCurso(a);
        const pesoB = obtenerPesoCurso(b);
        if (pesoA !== pesoB) return pesoA - pesoB;
        return a.localeCompare(b);
    });
    const selector = document.getElementById('selectorPrincipal');
    selector.innerHTML = '<option value="">-- Seleccione un Curso --</option>' + 
        cursos.map(c => `<option value="${c}">${c}</option>`).join('');
    limpiarContenedor();
}

function limpiarContenedor() {
    document.getElementById('contenedorHorario').innerHTML = `
        <div class="estado-inicial">
            💡 Por favor, seleccione un elemento de la lista para desplegar la matriz horaria.
        </div>`;
}

// 7. PROCESAR SELECCIÓN Y GENERAR TABLA MATRIZ (CONSTRUCCIÓN SEGURA DE DIAS)
function procesarSeleccion() {
    const valor = document.getElementById('selectorPrincipal').value;
    if (!valor) {
        limpiarContenedor();
        return;
    }

    const contenedor = document.getElementById('contenedorHorario');
    const clasesFiltradas = DATA_HORARIOS.filter(item => 
        perfilActual === 'docentes' ? item.Profesor === valor : item.Curso === valor
    );

    let cabeceraHtml = "";
    if (perfilActual === 'docentes') {
        cabeceraHtml = `
            <div class="cabecera-horario">
                <div>
                    <h3>${valor}</h3>
                    <p>Horario Individual del Docente • Visualización de Rangos Dobles en la Tarde</p>
                </div>
                <button onclick="window.print()" class="btn-print no-print">🖨️ Imprimir Horario</button>
            </div>`;
    } else {
        cabeceraHtml = `
            <div class="cabecera-horario">
                <div>
                    <h3>${valor}</h3>
                    <p>👨‍🏫 Tutor de Aula: <span style="color: #9ca3af; font-style: italic;">Por asignar</span></p>
                </div>
                <button onclick="window.print()" class="btn-print no-print">🖨️ Imprimir Horario</button>
            </div>`;
    }

    // Armar las etiquetas de los días de forma concatenada tradicional para evitar fallos de comillas
    let cabeceraDiasHtml = "";
    for (let i = 0; i < DIAS_SEMANA.length; i++) {
        cabeceraDiasHtml += "<th>" + DIAS_SEMANA[i] + "</th>";
    }

    let tablaHtml = `
        <div class="tabla-contenedor">
            <div class="overflow-x">
                <table>
                    <thead>
                        <tr>
                            <th class="col-hora">Hora / Timbre</th>
                            ` + cabeceraDiasHtml + `
                        </tr>
                    </thead>
                    <tbody>`;

    for (let h = 1; h <= 9; h++) {
        if (h === 5) {
            tablaHtml += `
                <tr class="fila-recreo">
                    <td>10:00 - 10:25</td>
                    <td colspan="5">🔔 Recreo General (25 Minutos) 🔔</td>
                </tr>`;
        }

        const rangoHorarioText = obtenerRangoHorario(h, valor, perfilActual === 'docentes');

        tablaHtml += `<tr>
            <td class="col-hora">
                <div class="num-hora">${h}° Hora</div>
                <div class="txt-timbre">${rangoHorarioText}</div>
            </td>`;

        for (let d = 0; d < DIAS_SEMANA.length; d++) {
            const diaActual = DIAS_SEMANA[d];
            const clase = clasesFiltradas.find(c => parseInt(c.Hora) === h && c.Día.toLowerCase() === diaActual.toLowerCase());

            tablaHtml += `<td>`;
            if (clase) {
                if (perfilActual === 'docentes') {
                    tablaHtml += `
                        <div class="txt-principal">${clase.Curso}</div>
                        <div class="txt-secundario">${clase.Asignatura}</div>`;
                } else {
                    const profesorLimpio = clase.Profesor.replace(/.*?/g, '').trim();
                    tablaHtml += `
                        <div class="txt-principal">${clase.Asignatura}</div>
                        <div class="txt-secundario">${profesorLimpio}</div>`;
                }
            } else {
                tablaHtml += `<span class="txt-vacio">-</span>`;
            }
            tablaHtml += `</td>`;
        }
        tablaHtml += `</tr>`;
    }

    tablaHtml += `</tbody></table></div></div>`;
    contenedor.innerHTML = cabeceraHtml + tablaHtml;
}
