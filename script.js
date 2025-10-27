document.addEventListener('DOMContentLoaded', function() {
    // Menu hamburguer
    const hamburguer = document.querySelector('.hamburguer');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.querySelector('.sidebar-overlay');
    const sidebarClose = document.querySelector('.sidebar-close');
    
    hamburguer.addEventListener('click', function() {
        sidebar.classList.add('active');
        sidebarOverlay.classList.add('active');
    });
    
    sidebarClose.addEventListener('click', closeSidebar);
    sidebarOverlay.addEventListener('click', closeSidebar);
    
    function closeSidebar() {
        sidebar.classList.remove('active');
        sidebarOverlay.classList.remove('active');
    }
    
    // Sistema de busca
    const searchBar = document.getElementById('searchBar');
    
    searchBar.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase();
        const cards = document.querySelectorAll('.card-exercicio');
        
        cards.forEach(card => {
            const title = card.querySelector('h4').textContent.toLowerCase();
            const description = card.querySelector('p').textContent.toLowerCase();
            
            if (title.includes(searchTerm) || description.includes(searchTerm)) {
                card.style.display = 'block';
            } else {
                card.style.display = 'none';
            }
        });
    });
    
    // Navegação entre páginas
    const pages = document.querySelectorAll('.page');
    
    function showPage(pageId) {
        // Esconder todas as páginas
        pages.forEach(page => {
            page.classList.remove('active');
        });
        
        // Mostrar a página selecionada
        const targetPage = document.getElementById(pageId);
        if (targetPage) {
            targetPage.classList.add('active');
        }
        
        // Parar timer quando sair da página inicial
        if (pageId !== 'inicio' && timerInterval) {
            pauseTimer();
        }
    }
    
    // Event listeners para navegação
    const menuLinks = document.querySelectorAll('.sidebar a, footer a[data-section], nav a');
    
    menuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Fechar menu lateral se estiver aberto
            closeSidebar();
            
            const targetSection = this.getAttribute('data-section');
            const targetCategory = this.getAttribute('data-category');
            
            if (targetSection) {
                // Navegar para uma seção específica
                showPage(targetSection);
                
                // Inicializar funcionalidades específicas da página
                if (targetSection === 'flashcards') {
                    initFlashcards();
                } else if (targetSection === 'quiz') {
                    initQuiz();
                }
            } else if (targetCategory) {
                // Navegar para a lista de exercícios de uma categoria
                showExercisesList(targetCategory);
            }
        });
    });
    
    // Botões que redirecionam para categorias
    const categoryButtons = document.querySelectorAll('button[data-category], .category-card');
    
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const category = this.getAttribute('data-category');
            if (category) {
                showExercisesList(category);
            }
        });
    });
    
    // Botões que redirecionam para seções
    const sectionButtons = document.querySelectorAll('button[data-section]');
    
    sectionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const section = this.getAttribute('data-section');
            if (section) {
                showPage(section);
                
                // Inicializar funcionalidades específicas da página
                if (section === 'flashcards') {
                    initFlashcards();
                } else if (section === 'quiz') {
                    initQuiz();
                }
            }
        });
    });
    
    // Botão voltar na página de lista de exercícios
    const backButton = document.querySelector('.back-button');
    if (backButton) {
        backButton.addEventListener('click', function() {
            showPage('exercicios');
        });
    }
    
    // ========== TIMER DE ESTUDO ==========
    let timerInterval;
    let timerSeconds = 0;
    let timerRunning = false;
    let totalStudyTime = 0; // Em segundos
    
    const studyTimeDisplay = document.getElementById('studyTime');
    const startTimerBtn = document.getElementById('startTimer');
    const pauseTimerBtn = document.getElementById('pauseTimer');
    const resetTimerBtn = document.getElementById('resetTimer');
    
    // Carregar tempo total de estudo do localStorage
    function loadStudyTime() {
        const savedTime = localStorage.getItem('totalStudyTime');
        if (savedTime) {
            totalStudyTime = parseInt(savedTime);
            updateStudyTimeDisplay();
        }
    }
    
    // Salvar tempo total de estudo no localStorage
    function saveStudyTime() {
        localStorage.setItem('totalStudyTime', totalStudyTime.toString());
        updateProgressStats();
    }
    
    // Atualizar display do tempo total
    function updateStudyTimeDisplay() {
        const hours = Math.floor(totalStudyTime / 3600);
        const minutes = Math.floor((totalStudyTime % 3600) / 60);
        const seconds = totalStudyTime % 60;
        
        document.getElementById('study-hours').textContent = `${hours}h`;
    }
    
    // Formatar tempo para display
    function formatTime(seconds) {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    
    // Iniciar timer
    function startTimer() {
        if (!timerRunning) {
            timerRunning = true;
            timerInterval = setInterval(() => {
                timerSeconds++;
                studyTimeDisplay.textContent = formatTime(timerSeconds);
            }, 1000);
        }
    }
    
    // Pausar timer
    function pauseTimer() {
        if (timerRunning) {
            timerRunning = false;
            clearInterval(timerInterval);
            
            // Adicionar tempo ao total
            totalStudyTime += timerSeconds;
            saveStudyTime();
        }
    }
    
    // Resetar timer
    function resetTimer() {
        pauseTimer();
        timerSeconds = 0;
        studyTimeDisplay.textContent = formatTime(timerSeconds);
    }
    
    // Event listeners do timer
    if (startTimerBtn && pauseTimerBtn && resetTimerBtn) {
        startTimerBtn.addEventListener('click', startTimer);
        pauseTimerBtn.addEventListener('click', pauseTimer);
        resetTimerBtn.addEventListener('click', resetTimer);
    }
    
    // ========== FLASHCARDS ==========
    let currentFlashcardSet = [];
    let currentFlashcardIndex = 0;
    
    function initFlashcards() {
        // Dados de exemplo para flashcards
        const flashcardSets = {
            biologia: [
                { question: "O que é mitocôndria?", answer: "Organela responsável pela produção de energia na célula" },
                { question: "Qual a função do núcleo celular?", answer: "Armazenar o material genético (DNA) da célula" },
                { question: "O que é fotossíntese?", answer: "Processo pelo qual plantas convertem luz solar em energia química" }
            ],
            historia: [
                { question: "Quando ocorreu a Proclamação da República?", answer: "15 de novembro de 1889" },
                { question: "Quem foi Tiradentes?", answer: "Joaquim José da Silva Xavier, mártir da Inconfidência Mineira" },
                { question: "O que foi a Era Vargas?", answer: "Período de 1930 a 1945 quando Getúlio Vargas governou o Brasil" }
            ],
            quimica: [
                { question: "Qual o símbolo do oxigênio?", answer: "O" },
                { question: "O que é uma ligação iônica?", answer: "Ligação entre íons de cargas opostas" },
                { question: "Qual o pH da água pura?", answer: "7 (neutro)" }
            ]
        };
        
        // Event listeners para conjuntos de flashcards
        const flashcardSetsElements = document.querySelectorAll('.flashcard-set');
        flashcardSetsElements.forEach(set => {
            set.addEventListener('click', function() {
                const setType = this.getAttribute('data-set');
                if (flashcardSets[setType]) {
                    currentFlashcardSet = [...flashcardSets[setType]]; // Cópia do array
                    currentFlashcardIndex = 0;
                    loadFlashcard();
                    document.querySelector('.flashcard-sets').style.display = 'none';
                    document.querySelector('.flashcard-container').style.display = 'block';
                }
            });
        });
        
        // Event listener para virar o flashcard
        const flashcard = document.getElementById('flashcard');
        if (flashcard) {
            flashcard.addEventListener('click', function() {
                this.classList.toggle('flipped');
            });
        }
        
        // Controles de navegação
        document.getElementById('prev-card').addEventListener('click', prevFlashcard);
        document.getElementById('next-card').addEventListener('click', nextFlashcard);
        document.getElementById('shuffle-cards').addEventListener('click', shuffleFlashcards);
    }
    
    function loadFlashcard() {
        if (currentFlashcardSet.length === 0) return;
        
        const flashcard = document.getElementById('flashcard');
        const questionElement = document.getElementById('flashcard-question');
        const answerElement = document.getElementById('flashcard-answer');
        const currentCardElement = document.getElementById('current-card');
        const totalCardsElement = document.getElementById('total-cards');
        
        questionElement.textContent = currentFlashcardSet[currentFlashcardIndex].question;
        answerElement.textContent = currentFlashcardSet[currentFlashcardIndex].answer;
        currentCardElement.textContent = currentFlashcardIndex + 1;
        totalCardsElement.textContent = currentFlashcardSet.length;
        
        // Resetar rotação do card
        flashcard.classList.remove('flipped');
    }
    
    function nextFlashcard() {
        if (currentFlashcardSet.length === 0) return;
        
        currentFlashcardIndex = (currentFlashcardIndex + 1) % currentFlashcardSet.length;
        loadFlashcard();
    }
    
    function prevFlashcard() {
        if (currentFlashcardSet.length === 0) return;
        
        currentFlashcardIndex = currentFlashcardIndex === 0 ? 
            currentFlashcardSet.length - 1 : currentFlashcardIndex - 1;
        loadFlashcard();
    }
    
    function shuffleFlashcards() {
        if (currentFlashcardSet.length === 0) return;
        
        // Algoritmo de Fisher-Yates para embaralhar
        for (let i = currentFlashcardSet.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentFlashcardSet[i], currentFlashcardSet[j]] = [currentFlashcardSet[j], currentFlashcardSet[i]];
        }
        
        currentFlashcardIndex = 0;
        loadFlashcard();
    }
    
    // ========== QUIZ ==========
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let quizTimer = null;
    let quizTime = 0;
    
    function initQuiz() {
        // Dados de exemplo para quizzes
        const quizData = {
            matematica: {
                title: "Quiz de Matemática",
                questions: [
                    {
                        question: "Qual o resultado de 15 + 27?",
                        options: ["32", "42", "52", "62"],
                        correct: 1
                    },
                    {
                        question: "Quanto é 8 × 7?",
                        options: ["48", "56", "64", "72"],
                        correct: 1
                    },
                    {
                        question: "Qual a raiz quadrada de 144?",
                        options: ["10", "11", "12", "13"],
                        correct: 2
                    }
                ]
            },
            portugues: {
                title: "Quiz de Português",
                questions: [
                    {
                        question: "Qual o plural de 'cidadão'?",
                        options: ["Cidadãos", "Cidadões", "Cidadães", "Cidadãos"],
                        correct: 0
                    },
                    {
                        question: "Qual destas palavras é um substantivo?",
                        options: ["Correr", "Bonito", "Casa", "Rapidamente"],
                        correct: 2
                    }
                ]
            },
            ciencias: {
                title: "Quiz de Ciências",
                questions: [
                    {
                        question: "Quantos planetas existem no sistema solar?",
                        options: ["7", "8", "9", "10"],
                        correct: 1
                    },
                    {
                        question: "Qual o elemento químico mais abundante na Terra?",
                        options: ["Oxigênio", "Silício", "Ferro", "Alumínio"],
                        correct: 0
                    }
                ]
            }
        };
        
        // Event listeners para categorias de quiz
        const quizCategories = document.querySelectorAll('.quiz-category');
        quizCategories.forEach(category => {
            category.addEventListener('click', function() {
                const quizType = this.getAttribute('data-quiz');
                if (quizData[quizType]) {
                    startQuiz(quizData[quizType]);
                }
            });
        });
        
        // Controles do quiz
        document.getElementById('prev-question').addEventListener('click', prevQuestion);
        document.getElementById('next-question').addEventListener('click', nextQuestion);
        document.getElementById('submit-quiz').addEventListener('click', submitQuiz);
        document.getElementById('restart-quiz').addEventListener('click', restartQuiz);
    }
    
    function startQuiz(quiz) {
        currentQuiz = quiz;
        currentQuestionIndex = 0;
        userAnswers = new Array(quiz.questions.length).fill(null);
        quizTime = 0;
        
        // Mostrar interface do quiz
        document.querySelector('.quiz-categories').style.display = 'none';
        document.getElementById('quiz-interface').style.display = 'block';
        document.getElementById('quiz-results').style.display = 'none';
        
        // Iniciar timer do quiz
        startQuizTimer();
        
        // Carregar primeira questão
        loadQuestion();
    }
    
    function startQuizTimer() {
        if (quizTimer) clearInterval(quizTimer);
        
        quizTimer = setInterval(() => {
            quizTime++;
            const minutes = Math.floor(quizTime / 60);
            const seconds = quizTime % 60;
            document.getElementById('quiz-time').textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }
    
    function loadQuestion() {
        if (!currentQuiz) return;
        
        const question = currentQuiz.questions[currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const quizOptions = document.getElementById('quiz-options');
        const currentQuestion = document.getElementById('current-question');
        const totalQuestions = document.getElementById('total-questions');
        
        // Atualizar texto da questão
        questionText.textContent = question.question;
        
        // Atualizar progresso
        currentQuestion.textContent = currentQuestionIndex + 1;
        totalQuestions.textContent = currentQuiz.questions.length;
        
        // Limpar opções anteriores
        quizOptions.innerHTML = '';
        
        // Adicionar novas opções
        question.options.forEach((option, index) => {
            const optionElement = document.createElement('button');
            optionElement.className = 'quiz-option';
            if (userAnswers[currentQuestionIndex] === index) {
                optionElement.classList.add('selected');
            }
            optionElement.textContent = option;
            optionElement.addEventListener('click', () => selectOption(index));
            quizOptions.appendChild(optionElement);
        });
        
        // Atualizar estado dos botões de navegação
        document.getElementById('prev-question').disabled = currentQuestionIndex === 0;
    }
    
    function selectOption(optionIndex) {
        userAnswers[currentQuestionIndex] = optionIndex;
        loadQuestion(); // Recarregar para atualizar seleção
    }
    
    function prevQuestion() {
        if (currentQuestionIndex > 0) {
            currentQuestionIndex--;
            loadQuestion();
        }
    }
    
    function nextQuestion() {
        if (currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        }
    }
    
    function submitQuiz() {
        if (!currentQuiz) return;
        
        // Parar timer
        clearInterval(quizTimer);
        
        // Calcular pontuação
        let correctAnswers = 0;
        userAnswers.forEach((answer, index) => {
            if (answer === currentQuiz.questions[index].correct) {
                correctAnswers++;
            }
        });
        
        const scorePercentage = Math.round((correctAnswers / currentQuiz.questions.length) * 100);
        
        // Mostrar resultados
        document.getElementById('quiz-interface').style.display = 'none';
        document.getElementById('quiz-results').style.display = 'block';
        
        document.getElementById('score-percentage').textContent = `${scorePercentage}%`;
        document.getElementById('correct-answers').textContent = correctAnswers;
        document.getElementById('total-answers').textContent = currentQuiz.questions.length;
        
        // Atualizar círculo de pontuação
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.background = `conic-gradient(var(--secondary-color) ${scorePercentage}%, #e9ecef ${scorePercentage}%)`;
        
        // Atualizar estatísticas de progresso
        updateQuizStats(correctAnswers, currentQuiz.questions.length);
    }
    
    function restartQuiz() {
        document.getElementById('quiz-results').style.display = 'none';
        document.querySelector('.quiz-categories').style.display = 'block';
    }
    
    // ========== EXERCÍCIOS ==========
    // Dados simulados para os exercícios
    const exerciciosData = {
        'natureza': {
            titulo: 'Exercícios de Ciências da Natureza',
            descricao: 'Biologia, Química e Física',
            exercicios: [
                { titulo: 'Química Orgânica - Funções Nitrogenadas', dificuldade: 'Médio' },
                { titulo: 'Biologia Celular - Mitose e Meiose', dificuldade: 'Fácil' },
                { titulo: 'Física - Leis de Newton', dificuldade: 'Difícil' },
                { titulo: 'Química - Estequiometria', dificuldade: 'Médio' },
                { titulo: 'Biologia - Genética Mendeliana', dificuldade: 'Médio' },
                { titulo: 'Física - Termodinâmica', dificuldade: 'Difícil' }
            ]
        },
        'humanas': {
            titulo: 'Exercícios de Ciências Humanas',
            descricao: 'História, Geografia, Filosofia e Sociologia',
            exercicios: [
                { titulo: 'História do Brasil - Período Colonial', dificuldade: 'Fácil' },
                { titulo: 'Geografia - Globalização', dificuldade: 'Médio' },
                { titulo: 'Filosofia - Pensamento Grego', dificuldade: 'Difícil' },
                { titulo: 'Sociologia - Movimentos Sociais', dificuldade: 'Médio' }
            ]
        },
        'exatas': {
            titulo: 'Exercícios de Ciências Exatas',
            descricao: 'Matemática, Física e Química',
            exercicios: [
                { titulo: 'Matemática - Funções de 2º Grau', dificuldade: 'Fácil' },
                { titulo: 'Física - Cinemática', dificuldade: 'Médio' },
                { titulo: 'Química - Tabela Periódica', dificuldade: 'Fácil' },
                { titulo: 'Matemática - Geometria Espacial', dificuldade: 'Difícil' },
                { titulo: 'Física - Eletricidade', dificuldade: 'Difícil' }
            ]
        }
    };
    
    function showExercisesList(category) {
        const categoryData = exerciciosData[category];
        
        if (categoryData) {
            // Atualizar título e descrição
            document.getElementById('categoria-titulo').textContent = categoryData.titulo;
            document.getElementById('categoria-descricao').textContent = categoryData.descricao;
            
            // Limpar container de exercícios
            const container = document.getElementById('exercicios-container');
            container.innerHTML = '';
            
            // Adicionar exercícios
            categoryData.exercicios.forEach(exercicio => {
                const exerciseItem = document.createElement('div');
                exerciseItem.className = 'col-md-6';
                exerciseItem.innerHTML = `
                    <div class="exercise-item">
                        <div class="exercise-header">
                            <span class="exercise-title">${exercicio.titulo}</span>
                            <span class="exercise-difficulty difficulty-${exercicio.dificuldade.toLowerCase()}">${exercicio.dificuldade}</span>
                        </div>
                        <p>Clique para iniciar este exercício</p>
                        <button class="btn btn-sm btn-primary iniciar-exercicio">Iniciar</button>
                    </div>
                `;
                container.appendChild(exerciseItem);
            });
            
            // Mostrar página de lista de exercícios
            showPage('lista-exercicios');
        }
    }
    
    // Botões de iniciar exercício
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('iniciar-exercicio')) {
            const exerciseTitle = e.target.closest('.exercise-item').querySelector('.exercise-title').textContent;
            alert(`Iniciando exercício: ${exerciseTitle}\n\nEsta funcionalidade se conectaria com sua API para carregar o exercício específico.`);
            
            // Simular conclusão de exercício para atualizar estatísticas
            simulateExerciseCompletion();
        }
    });
    
    // Botões de simulado
    const simuladoButtons = document.querySelectorAll('.card-simulado .btn-primary');
    simuladoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const simuladoTitle = this.closest('.card-simulado').querySelector('h4').textContent;
            alert(`Iniciando: ${simuladoTitle}\n\nEsta funcionalidade se conectaria com sua API para carregar o simulado.`);
        });
    });
    
    // ========== CONFIGURAÇÕES ==========
    const modoEscuroCheckbox = document.getElementById('modo-escuro');
    const somCheckbox = document.getElementById('som-ativado');
    const horasEstudoSelect = document.getElementById('horas-estudo');
    const pomodoroTimeSelect = document.getElementById('pomodoro-time');
    const saveConfigButton = document.getElementById('salvar-configuracoes');
    
    // Carregar configurações salvas
    function carregarConfiguracoes() {
        const configSalvas = JSON.parse(localStorage.getItem('configuracoesStudyHub')) || {};
        
        // Aplicar modo escuro se estiver salvo
        if (configSalvas.modoEscuro) {
            document.body.classList.add('modo-escuro');
            if (modoEscuroCheckbox) modoEscuroCheckbox.checked = true;
        }
        
        // Aplicar som se estiver salvo
        if (configSalvas.som && somCheckbox) {
            somCheckbox.checked = true;
        }
        
        // Aplicar horas de estudo se estiver salvo
        if (configSalvas.horasEstudo && horasEstudoSelect) {
            horasEstudoSelect.value = configSalvas.horasEstudo;
        }
        
        // Aplicar tempo pomodoro se estiver salvo
        if (configSalvas.pomodoroTime && pomodoroTimeSelect) {
            pomodoroTimeSelect.value = configSalvas.pomodoroTime;
        }
    }
    
    // Salvar configurações
    function salvarConfiguracoes() {
        const configuracoes = {
            modoEscuro: modoEscuroCheckbox ? modoEscuroCheckbox.checked : false,
            som: somCheckbox ? somCheckbox.checked : false,
            horasEstudo: horasEstudoSelect ? horasEstudoSelect.value : '10 horas',
            pomodoroTime: pomodoroTimeSelect ? pomodoroTimeSelect.value : '30 minutos'
        };
        
        localStorage.setItem('configuracoesStudyHub', JSON.stringify(configuracoes));
        
        // Aplicar modo escuro imediatamente
        if (configuracoes.modoEscuro) {
            document.body.classList.add('modo-escuro');
        } else {
            document.body.classList.remove('modo-escuro');
        }
        
        // Tocar som de confirmação se estiver ativado
        if (configuracoes.som) {
            tocarSomConfirmacao();
        }
        
        alert('Configurações salvas com sucesso!');
    }
    
    // Função para tocar som de confirmação
    function tocarSomConfirmacao() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.5);
        } catch (e) {
            console.log('Não foi possível reproduzir o som:', e);
        }
    }
    
    // Event listener para o botão salvar
    if (saveConfigButton) {
        saveConfigButton.addEventListener('click', salvarConfiguracoes);
    }
    
    // Event listener para mudança imediata do modo escuro
    if (modoEscuroCheckbox) {
        modoEscuroCheckbox.addEventListener('change', function() {
            if (this.checked) {
                document.body.classList.add('modo-escuro');
            } else {
                document.body.classList.remove('modo-escuro');
            }
        });
    }
    
    // ========== PROGRESSO E ESTATÍSTICAS ==========
    let totalExercisesCompleted = 0;
    let totalQuestionsAnswered = 0;
    let totalCorrectAnswers = 0;
    
    function loadProgressStats() {
        const stats = JSON.parse(localStorage.getItem('studyProgressStats')) || {
            exercisesCompleted: 0,
            questionsAnswered: 0,
            correctAnswers: 0
        };
        
        totalExercisesCompleted = stats.exercisesCompleted;
        totalQuestionsAnswered = stats.questionsAnswered;
        totalCorrectAnswers = stats.correctAnswers;
        
        updateProgressStats();
    }
    
    function saveProgressStats() {
        const stats = {
            exercisesCompleted: totalExercisesCompleted,
            questionsAnswered: totalQuestionsAnswered,
            correctAnswers: totalCorrectAnswers
        };
        
        localStorage.setItem('studyProgressStats', JSON.stringify(stats));
        updateProgressStats();
    }
    
    function updateProgressStats() {
        // Atualizar estatísticas gerais
        document.getElementById('total-exercises').textContent = totalExercisesCompleted;
        
        const accuracyRate = totalQuestionsAnswered > 0 ? 
            Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;
        document.getElementById('accuracy-rate').textContent = `${accuracyRate}%`;
        
        // Tempo de estudo já é atualizado separadamente
    }
    
    function updateQuizStats(correct, total) {
        totalQuestionsAnswered += total;
        totalCorrectAnswers += correct;
        saveProgressStats();
    }
    
    function simulateExerciseCompletion() {
        totalExercisesCompleted++;
        saveProgressStats();
    }
    
    // ========== INICIALIZAÇÃO ==========
    function initializeApp() {
        loadStudyTime();
        loadProgressStats();
        carregarConfiguracoes();
        
        // Inicializar funcionalidades específicas se estiverem na página ativa
        if (document.getElementById('flashcards').classList.contains('active')) {
            initFlashcards();
        }
        if (document.getElementById('quiz').classList.contains('active')) {
            initQuiz();
        }
    }
    
    // Inicializar a aplicação quando o DOM estiver carregado
    initializeApp();
});