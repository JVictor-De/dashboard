// script.js

// Variáveis globais para armazenar os dados dos alunos e cursos
let studentsData = [];
let coursesData = [];

// Variáveis globais para armazenar instâncias de gráficos Chart.js
let emotionDistributionChartInstance = null;
let avgHappinessChartInstance = null;
let stressTrendChartInstance = null;

/**
 * Função auxiliar para atualizar o conteúdo de texto de um elemento pelo seu ID.
 * @param {string} id - O ID do elemento HTML.
 * @param {string} text - O conteúdo de texto a ser definido.
 */
function updateTextContent(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    } else {
        // console.warn(`Elemento com ID '${id}' não encontrado.`); // Removido para simplificar a consola
    }
}

/**
 * Destrói uma instância de gráfico Chart.js existente, se houver.
 * @param {object} chartInstance - A instância do gráfico a ser destruída.
 * @returns {null} Retorna null após a destruição.
 */
function destroyChart(chartInstance) {
    if (chartInstance) {
        chartInstance.destroy();
    }
    return null;
}

/**
 * Popula o Dashboard do Aluno com dados para um determinado aluno.
 * @param {string} studentId - O ID do aluno a ser exibido.
 */
function populateStudentDashboard(studentId) {
    const student = studentsData.find(s => s.id === studentId);
    if (!student) {
        console.error("Aluno não encontrado:", studentId);
        // Limpar ou exibir mensagem de erro no dashboard
        updateTextContent('studentDashboardTitle', 'Visão Emocional do Aluno: Dados não encontrados.');
        updateTextContent('contactEnrollment', 'N/A');
        document.getElementById('recentEmotionLogsList').innerHTML = '<li>Dados não disponíveis.</li>';
        emotionDistributionChartInstance = destroyChart(emotionDistributionChartInstance);
        // Limpar o canvas se o gráfico não puder ser criado
        const emotionChartCanvas = document.getElementById('emotionDistributionChart');
        if (emotionChartCanvas) {
            const ctx = emotionChartCanvas.getContext('2d');
            ctx.clearRect(0, 0, emotionChartCanvas.width, emotionChartCanvas.height);
        }
        return;
    }

    // Atualiza o título do dashboard para ser genérico ou usar a matrícula
    updateTextContent('studentDashboardTitle', 'Visão Emocional do Aluno');

    // Contato do Aluno - Apenas Matrícula
    updateTextContent('contactEnrollment', student.enrollment);
    
    // Popula os Últimos Registros de Emoções (apenas a data da pesquisa)
    const recentLogsList = document.getElementById('recentEmotionLogsList');
    recentLogsList.innerHTML = ''; // Limpa a lista existente
    if (student.last_emotion_data_update) {
        const li = document.createElement('li');
        li.textContent = 'Última pesquisa: ' + student.last_emotion_data_update;
        recentLogsList.appendChild(li);
    } else if (student.recent_emotion_logs && student.recent_emotion_logs.length > 0) {
        const li = document.createElement('li');
        li.textContent = 'Última pesquisa: ' + student.recent_emotion_logs[0].date;
        recentLogsList.appendChild(li);
    } else {
        const li = document.createElement('li');
        li.textContent = 'Nenhum registro de emoção recente.';
        recentLogsList.appendChild(li);
    }

    // Renderiza o Gráfico de Distribuição de Emoções
    emotionDistributionChartInstance = destroyChart(emotionDistributionChartInstance); // Destrói o gráfico anterior
    const ctxEmotion = document.getElementById('emotionDistributionChart');
    if (ctxEmotion) { // Verifica se o canvas existe
        const ctx = ctxEmotion.getContext('2d');
        const emotionsLabels = Object.keys(student.emotions_distribution);
        const emotionsValues = Object.values(student.emotions_distribution);

        emotionDistributionChartInstance = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: emotionsLabels,
                datasets: [{
                    label: 'Intensidade da Emoção',
                    data: emotionsValues,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.7)', // Anger
                        'rgba(255, 206, 86, 0.7)', // Surprise
                        'rgba(75, 192, 192, 0.7)', // Happiness
                        'rgba(153, 102, 255, 0.7)', // Sadness
                        'rgba(201, 203, 207, 0.7)' // Neutral (if present)
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(201, 203, 207, 1)'
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Distribuição de Emoções',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false // Não mostrar legenda para barras simples
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Intensidade'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Emoção'
                        }
                    }
                }
            }
        });
    } else {
        console.error("Elemento canvas 'emotionDistributionChart' não encontrado para renderizar o gráfico.");
    }
}

/**
 * Popula o Dashboard por Curso com dados para um determinado curso.
 * @param {string} courseId - O ID do curso a ser exibido.
 */
function populateCourseDashboard(courseId) {
    const course = coursesData.find(c => c.id === courseId);
    if (!course) {
        console.error("Curso não encontrado:", courseId);
        // Limpar ou exibir mensagem de erro no dashboard
        updateTextContent('courseDashboardTitle', 'Visão Emocional por Curso: Dados não encontrados.');
        updateTextContent('avgHappinessText', 'N/A');
        avgHappinessChartInstance = destroyChart(avgHappinessChartInstance);
        const avgHappinessCanvas = document.getElementById('avgHappinessChart');
        if (avgHappinessCanvas) avgHappinessCanvas.getContext('2d').clearRect(0, 0, avgHappinessCanvas.width, avgHappinessCanvas.height);
        stressTrendChartInstance = destroyChart(stressTrendChartInstance);
        const stressTrendCanvas = document.getElementById('stressTrendChart');
        if (stressTrendCanvas) stressTrendCanvas.getContext('2d').clearRect(0, 0, stressTrendCanvas.width, stressTrendCanvas.height);
        updateTextContent('commonEmotionsEngagement', 'N/A');
        updateTextContent('commonEmotionsFrustration', 'N/A');
        return;
    }

    // Atualiza o título do dashboard
    updateTextContent('courseDashboardTitle', 'Visão Emocional do Curso: ' + course.name);

    // Felicidade Média no Curso
    updateTextContent('avgHappinessText', 'Felicidade Média: ' + course.avg_happiness);
    avgHappinessChartInstance = destroyChart(avgHappinessChartInstance); // Destrói o gráfico anterior
    const avgHappinessCtx = document.getElementById('avgHappinessChart');
    if (avgHappinessCtx) { // Verifica se o canvas existe
        const ctx = avgHappinessCtx.getContext('2d');
        avgHappinessChartInstance = new Chart(ctx, {
            type: 'bar', // Pode ser 'bar' ou 'line' dependendo da preferência
            data: {
                labels: ['Felicidade Média'],
                datasets: [{
                    label: 'Nível de Felicidade',
                    data: [course.avg_happiness],
                    backgroundColor: 'rgba(75, 192, 192, 0.7)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Felicidade Média do Curso',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 20, // Assumindo uma escala de 0 a 20 para felicidade
                        title: {
                            display: true,
                            text: 'Nível'
                        }
                    },
                    x: {
                        display: false // Não mostrar rótulo no eixo X para uma única barra
                    }
                }
            }
        });
    } else {
        console.error("Elemento canvas 'avgHappinessChart' não encontrado para renderizar o gráfico.");
    }

    // Níveis de Estresse Agregados
    stressTrendChartInstance = destroyChart(stressTrendChartInstance); // Destrói o gráfico anterior
    const stressTrendCtx = document.getElementById('stressTrendChart');
    if (stressTrendCtx) { // Verifica se o canvas existe
        const ctx = stressTrendCtx.getContext('2d');
        const stressLabels = course.avg_stress_trend.map(d => 'Semana ' + d.week);
        const stressValues = course.avg_stress_trend.map(d => d.stress);

        stressTrendChartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: stressLabels,
                datasets: [{
                    label: 'Nível de Estresse',
                    data: stressValues,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)', // Área preenchida
                    tension: 0.4, // Curva suave
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Tendência de Estresse Agregado',
                        font: { size: 16 }
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 10, // Assumindo uma escala de 0 a 10 para estresse
                        title: {
                            display: true,
                            text: 'Estresse'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Semana do Curso'
                        }
                    }
                }
            }
        });
    } else {
        console.error("Elemento canvas 'stressTrendChart' não encontrado para renderizar o gráfico.");
    }


    // Emoções Mais Comuns no Curso
    updateTextContent('commonEmotionsEngagement', `${course.common_emotions.engagement_rate}%`);
    updateTextContent('commonEmotionsFrustration', `${course.common_emotions.frustration_rate}%`);
}

/**
 * Alterna entre os dashboards do aluno e do curso.
 * @param {string} dashboardId - O ID da seção do dashboard a ser ativada ('studentDashboard' ou 'courseDashboard').
 */
function switchDashboard(dashboardId) {
    // Desativa todas as seções do dashboard
    document.querySelectorAll('.dashboard-section').forEach(section => {
        section.classList.remove('active');
    });
    // Ativa a seção do dashboard selecionada
    document.getElementById(dashboardId).classList.add('active');

    // Desativa todos os botões de aba
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active', 'bg-purple-600', 'text-white', 'shadow-md');
        button.classList.add('text-gray-700', 'bg-gray-200', 'hover:bg-gray-300');
    });
    // Ativa o botão de aba selecionado
    const activeTabButton = document.getElementById(dashboardId.replace('Dashboard', 'Tab'));
    activeTabButton.classList.add('active', 'bg-purple-600', 'text-white', 'shadow-md');
    activeTabButton.classList.remove('text-gray-700', 'bg-gray-200', 'hover:bg-gray-300');

    // Carrega os dados para o dashboard ativo
    if (dashboardId === 'studentDashboard') {
        const selectedStudentId = document.getElementById('studentSelect').value;
        populateStudentDashboard(selectedStudentId);
    } else if (dashboardId === 'courseDashboard') {
        const selectedCourseId = document.getElementById('courseSelect').value;
        populateCourseDashboard(selectedCourseId);
    }
}

/**
 * Função assíncrona para carregar os dados do ficheiro db.json.
 * Após o carregamento, inicializa os dropdowns e popula o dashboard inicial.
 */
async function initializeDashboard() {
    try {
        // Realiza o fetch do ficheiro db.json
        const response = await fetch('db.json');
        if (!response.ok) {
            throw new Error(`Erro HTTP! Status: ${response.status}`);
        }
        const data = await response.json(); // Converte a resposta para JSON

        // Atribui os dados carregados às variáveis globais
        studentsData = data.students || [];
        coursesData = data.courses || [];

        // Popula o dropdown de alunos
        const studentSelect = document.getElementById('studentSelect');
        studentSelect.innerHTML = ''; // Limpa opções existentes
        studentsData.forEach(student => {
            const option = document.createElement('option');
            option.value = student.id;
            option.textContent = student.enrollment; // Usa a matrícula no dropdown
            studentSelect.appendChild(option);
        });
        // Define o valor selecionado padrão se houver alunos
        if (studentsData.length > 0) {
            studentSelect.value = studentsData[0].id;
        }
        studentSelect.addEventListener('change', (event) => {
            populateStudentDashboard(event.target.value);
        });

        // Popula o dropdown de cursos
        const courseSelect = document.getElementById('courseSelect');
        courseSelect.innerHTML = ''; // Limpa opções existentes
        coursesData.forEach(course => {
            const option = document.createElement('option');
            option.value = course.id;
            option.textContent = course.name;
            courseSelect.appendChild(option);
        });
        // Define o valor selecionado padrão se houver cursos
        if (coursesData.length > 0) {
            courseSelect.value = coursesData[0].id;
        }
        courseSelect.addEventListener('change', (event) => {
            populateCourseDashboard(event.target.value);
        });

        // Ativa o dashboard do aluno e carrega o primeiro aluno por padrão
        switchDashboard('studentDashboard'); // Popula o dashboard do aluno por padrão
    } catch (error) {
        console.error("Erro ao carregar dados do dashboard:", error);
        document.getElementById('studentDashboardTitle').textContent = 'Erro ao carregar dados do aluno.';
        document.getElementById('courseDashboardTitle').textContent = 'Erro ao carregar dados do curso.';
    }
}

// Inicializa o dashboard quando o DOM estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', initializeDashboard);
