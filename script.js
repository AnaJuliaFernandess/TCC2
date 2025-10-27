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
    
    // ========== SISTEMA DE BUSCA MELHORADO ==========
    const searchBar = document.getElementById('searchBar');
    
    searchBar.addEventListener('keyup', function() {
        const searchTerm = this.value.toLowerCase().trim();
        
        // Se a busca estiver vazia, mostrar todos os elementos
        if (searchTerm === '') {
            showAllContent();
            return;
        }
        
        // Elementos pesquisáveis
        const searchableElements = document.querySelectorAll(`
            .card-exercicio,
            .category-card,
            .flashcard-set,
            .quiz-category,
            .card-simulado,
            .exercise-item
        `);
        
        let foundResults = false;
        
        searchableElements.forEach(element => {
            const textContent = getElementText(element).toLowerCase();
            
            if (textContent.includes(searchTerm)) {
                element.style.display = 'block';
                element.classList.add('search-highlight');
                foundResults = true;
            } else {
                element.style.display = 'none';
                element.classList.remove('search-highlight');
            }
        });
        
        // Mostrar mensagem se não encontrar resultados
        showNoResultsMessage(!foundResults, searchTerm);
    });
    
    // Função para obter todo o texto de um elemento
    function getElementText(element) {
        return element.textContent || element.innerText || '';
    }
    
    // Função para mostrar todos os conteúdos
    function showAllContent() {
        const allElements = document.querySelectorAll(`
            .card-exercicio,
            .category-card,
            .flashcard-set,
            .quiz-category,
            .card-simulado,
            .exercise-item
        `);
        
        allElements.forEach(element => {
            element.style.display = 'block';
            element.classList.remove('search-highlight');
        });
        
        // Remover mensagem de nenhum resultado
        const existingMessage = document.querySelector('.no-results-message');
        if (existingMessage) {
            existingMessage.remove();
        }
    }
    
    // Função para mostrar mensagem quando não houver resultados
    function showNoResultsMessage(show, searchTerm) {
        const existingMessage = document.querySelector('.no-results-message');
        
        if (existingMessage) {
            existingMessage.remove();
        }
        
        if (show) {
            const message = document.createElement('div');
            message.className = 'no-results-message alert alert-info mt-4';
            message.innerHTML = `
                <i class="fas fa-search me-2"></i>
                Nenhum resultado encontrado para "<strong>${searchTerm}</strong>".
                Tente usar termos diferentes.
            `;
            
            // Inserir a mensagem no conteúdo principal
            const mainContent = document.querySelector('main .container');
            const activePage = mainContent.querySelector('.page.active');
            if (activePage) {
                activePage.appendChild(message);
            }
        }
    }
    
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
        
        // Limpar busca quando mudar de página
        searchBar.value = '';
        showAllContent();
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
    
    // ========== SISTEMA SQLITE PARA QUIZ ==========
    let db = null;
    let currentQuiz = null;
    let currentQuestionIndex = 0;
    let userAnswers = [];
    let quizTimer = null;
    let quizTime = 0;

    // Inicializar o banco de dados
    async function initDatabase() {
        try {
            // Verificar se SQL.js está disponível
            if (typeof initSqlJs === 'undefined') {
                console.log('SQL.js não carregado, usando localStorage como fallback');
                initLocalStorageFallback();
                return;
            }

            // Carregar SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `https://cdn.jsdelivr.net/npm/sql.js@1.8.0/dist/${file}`
            });
            
            // Criar novo banco de dados
            db = new SQL.Database();
            
            // Criar tabelas
            createTables();
            
            // Inserir questões iniciais
            insertSampleQuestions();
            
            console.log('Banco de dados SQLite inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar banco de dados:', error);
            // Fallback para localStorage se SQLite não funcionar
            initLocalStorageFallback();
        }
    }

    // Criar tabelas necessárias
    function createTables() {
        // Tabela de categorias
        db.run(`
            CREATE TABLE IF NOT EXISTS categories (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                description TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);
        
        // Tabela de questões
        db.run(`
            CREATE TABLE IF NOT EXISTS questions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                category_id INTEGER,
                question_text TEXT NOT NULL,
                option_a TEXT NOT NULL,
                option_b TEXT NOT NULL,
                option_c TEXT NOT NULL,
                option_d TEXT NOT NULL,
                correct_answer TEXT NOT NULL,
                explanation TEXT,
                difficulty TEXT CHECK(difficulty IN ('facil', 'medio', 'dificil')),
                subject TEXT,
                grade_level TEXT,
                time_estimate TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (category_id) REFERENCES categories (id)
            )
        `);
    }

    // Inserir questões de exemplo
    function insertSampleQuestions() {
        // Verificar se já existem questões para não duplicar
        const count = db.exec("SELECT COUNT(*) as count FROM questions");
        if (count[0] && count[0].values[0][0] > 0) return;
        
        // Inserir categorias
        const categories = [
            ['Matemática', 'Questões de matemática do ensino fundamental e médio'],
            ['Português', 'Questões de língua portuguesa e literatura'],
            ['Ciências', 'Questões de biologia, química e física'],
            ['História', 'Questões de história do Brasil e geral'],
            ['Geografia', 'Questões de geografia física e humana']
        ];
        
        categories.forEach(category => {
            db.run("INSERT INTO categories (name, description) VALUES (?, ?)", category);
        });
        
        // Inserir questões de exemplo
        const sampleQuestions = [
            // Matemática
            [1, 'Qual o resultado de 15 + 27?', '32', '42', '52', '62', 'B', '15 + 27 = 42', 'facil', 'Matemática', 'Fundamental', '2 minutos'],
            [1, 'Qual a área de um quadrado com lado 5 cm?', '20 cm²', '25 cm²', '30 cm²', '35 cm²', 'B', 'Área = lado × lado = 5 × 5 = 25 cm²', 'facil', 'Matemática', 'Fundamental', '3 minutos'],
            [1, 'Resolva a equação: 2x + 8 = 20', 'x = 4', 'x = 6', 'x = 8', 'x = 10', 'B', '2x + 8 = 20 → 2x = 12 → x = 6', 'medio', 'Matemática', 'Fundamental', '4 minutos'],
            
            // Português
            [2, 'Qual alternativa apresenta concordância verbal correta?', 'Os alunos estudaram para a prova', 'Os alunos estudou para a prova', 'Os alunos estudamos para a prova', 'Os alunos estudarei para a prova', 'A', 'O verbo deve concordar com o sujeito "Os alunos" (3ª pessoa do plural)', 'medio', 'Português', 'Médio', '5 minutos'],
            [2, 'Que figura de linguagem está presente em "O vento sussurrava segredos"?', 'Personificação', 'Metáfora', 'Hipérbole', 'Antítese', 'A', 'Personificação é atribuir características humanas a seres não-humanos', 'medio', 'Português', 'Médio', '4 minutos'],
            
            // Ciências
            [3, 'Qual organela é responsável pela produção de energia?', 'Mitocôndria', 'Núcleo', 'Complexo de Golgi', 'Retículo endoplasmático', 'A', 'A mitocôndria é a usina de energia da célula', 'facil', 'Biologia', 'Médio', '3 minutos'],
            [3, 'Qual o símbolo químico do Ouro?', 'Au', 'Ag', 'Fe', 'Cu', 'A', 'O símbolo Au vem do latim "Aurum"', 'facil', 'Química', 'Médio', '2 minutos']
        ];
        
        sampleQuestions.forEach(q => {
            db.run(`
                INSERT INTO questions 
                (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, subject, grade_level, time_estimate) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, q);
        });
    }

    // Fallback para localStorage se SQLite não funcionar
    function initLocalStorageFallback() {
        console.log('Usando localStorage como fallback');
        if (!localStorage.getItem('quiz_questions')) {
            const defaultQuestions = [
                {
                    id: 1,
                    category_id: 1,
                    question_text: 'Qual o resultado de 15 + 27?',
                    option_a: '32',
                    option_b: '42', 
                    option_c: '52',
                    option_d: '62',
                    correct_answer: 'B',
                    explanation: '15 + 27 = 42',
                    difficulty: 'facil',
                    subject: 'Matemática',
                    grade_level: 'Fundamental',
                    time_estimate: '2 minutos'
                }
            ];
            localStorage.setItem('quiz_questions', JSON.stringify(defaultQuestions));
        }
    }

    // Buscar questões por categoria
    function getQuestionsByCategory(categoryId) {
        try {
            if (!db) {
                return getQuestionsFromLocalStorage(categoryId);
            }
            
            const result = db.exec(`
                SELECT * FROM questions 
                WHERE category_id = ? 
                ORDER BY RANDOM() 
                LIMIT 10
            `, [categoryId]);
            
            return formatSQLResult(result);
        } catch (error) {
            console.error('Erro ao buscar questões:', error);
            return getQuestionsFromLocalStorage(categoryId);
        }
    }

    function getQuestionsFromLocalStorage(categoryId) {
        const questions = JSON.parse(localStorage.getItem('quiz_questions') || '[]');
        return questions.filter(q => q.category_id == categoryId);
    }

    // Buscar todas as categorias
    function getAllCategories() {
        try {
            if (!db) {
                return [
                    { id: 1, name: 'Matemática', description: 'Questões de matemática' },
                    { id: 2, name: 'Português', description: 'Questões de português' },
                    { id: 3, name: 'Ciências', description: 'Questões de ciências' }
                ];
            }
            
            const result = db.exec('SELECT * FROM categories ORDER BY name');
            return formatSQLResult(result);
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            return [
                { id: 1, name: 'Matemática', description: 'Questões de matemática' },
                { id: 2, name: 'Português', description: 'Questões de português' },
                { id: 3, name: 'Ciências', description: 'Questões de ciências' }
            ];
        }
    }

    // Formatar resultado do SQL
    function formatSQLResult(result) {
        if (!result || result.length === 0) return [];
        
        const columns = result[0].columns;
        const values = result[0].values;
        
        return values.map(row => {
            const obj = {};
            columns.forEach((col, index) => {
                obj[col] = row[index];
            });
            return obj;
        });
    }

    // ========== QUIZ COM SQLITE ==========
    function initQuiz() {
        const categories = getAllCategories();
        const quizCategories = document.querySelector('.quiz-categories');
        
        quizCategories.innerHTML = `
            <div class="row">
                ${categories.map(category => `
                    <div class="col-md-4 mb-4">
                        <div class="quiz-category" data-category="${category.id}">
                            <div class="quiz-icon">
                                <i class="fas fa-book fa-3x"></i>
                            </div>
                            <h4>${category.name}</h4>
                            <p>${category.description}</p>
                            <span class="badge">10 questões</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Event listeners para as categorias
        document.querySelectorAll('.quiz-category[data-category]').forEach(category => {
            category.addEventListener('click', function() {
                const categoryId = this.getAttribute('data-category');
                startQuiz(categoryId);
            });
        });
    }

    function startQuiz(categoryId) {
        const questions = getQuestionsByCategory(categoryId);
        
        if (questions.length === 0) {
            alert('Nenhuma questão encontrada para esta categoria!');
            return;
        }
        
        currentQuiz = {
            questions: questions,
            currentQuestionIndex: 0,
            userAnswers: new Array(questions.length).fill(null),
            startTime: new Date()
        };
        
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
        
        const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
        const questionText = document.getElementById('question-text');
        const quizOptions = document.getElementById('quiz-options');
        const currentQuestion = document.getElementById('current-question');
        const totalQuestions = document.getElementById('total-questions');
        
        // Atualizar texto da questão
        questionText.textContent = question.question_text;
        
        // Atualizar progresso
        currentQuestion.textContent = currentQuiz.currentQuestionIndex + 1;
        totalQuestions.textContent = currentQuiz.questions.length;
        
        // Limpar opções anteriores
        quizOptions.innerHTML = '';
        
        // Adicionar novas opções
        const options = [
            { letter: 'A', text: question.option_a },
            { letter: 'B', text: question.option_b },
            { letter: 'C', text: question.option_c },
            { letter: 'D', text: question.option_d }
        ];
        
        options.forEach(option => {
            const optionElement = document.createElement('button');
            optionElement.className = 'quiz-option';
            if (currentQuiz.userAnswers[currentQuiz.currentQuestionIndex] === option.letter) {
                optionElement.classList.add('selected');
            }
            optionElement.innerHTML = `
                <span class="option-letter">${option.letter}</span>
                <span class="option-text">${option.text}</span>
            `;
            optionElement.addEventListener('click', () => selectOption(option.letter));
            quizOptions.appendChild(optionElement);
        });
        
        // Atualizar estado dos botões de navegação
        document.getElementById('prev-question').disabled = currentQuiz.currentQuestionIndex === 0;
    }
    
    function selectOption(optionLetter) {
        currentQuiz.userAnswers[currentQuiz.currentQuestionIndex] = optionLetter;
        loadQuestion(); // Recarregar para atualizar seleção
    }
    
    function prevQuestion() {
        if (currentQuiz.currentQuestionIndex > 0) {
            currentQuiz.currentQuestionIndex--;
            loadQuestion();
        }
    }
    
    function nextQuestion() {
        if (currentQuiz.currentQuestionIndex < currentQuiz.questions.length - 1) {
            currentQuiz.currentQuestionIndex++;
            loadQuestion();
        }
    }
    
    function submitQuiz() {
        if (!currentQuiz) return;
        
        // Parar timer
        clearInterval(quizTimer);
        
        // Calcular pontuação
        let correctAnswers = 0;
        currentQuiz.userAnswers.forEach((answer, index) => {
            if (answer === currentQuiz.questions[index].correct_answer) {
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
        currentQuiz = null;
        userAnswers = [];
        quizTime = 0;
    }
    
    // ========== EXERCÍCIOS ==========
    // Função para carregar exercícios
    function showExercisesList(category) {
        // Atualizar título e descrição
        document.getElementById('categoria-titulo').textContent = getCategoryTitle(category);
        document.getElementById('categoria-descricao').textContent = getCategoryDescription(category);
        
        // Limpar container de exercícios
        const container = document.getElementById('exercicios-container');
        container.innerHTML = '<div class="text-center"><div class="spinner-border" role="status"><span class="visually-hidden">Carregando...</span></div><p class="mt-2">Carregando exercícios...</p></div>';
        
        // Por enquanto, vamos mostrar uma mensagem
        setTimeout(() => {
            container.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info">
                        <h5>Exercícios da Categoria ${getCategoryTitle(category)}</h5>
                        <p>Esta funcionalidade carregará exercícios da categoria <strong>${category}</strong>.</p>
                    </div>
                </div>
            `;
        }, 1000);
        
        // Mostrar página de lista de exercícios
        showPage('lista-exercicios');
    }
    
    function getCategoryTitle(category) {
        const titles = {
            'natureza': 'Exercícios de Ciências da Natureza',
            'humanas': 'Exercícios de Ciências Humanas',
            'exatas': 'Exercícios de Ciências Exatas',
            'linguagem': 'Exercícios de Linguagens',
            'vestibular': 'Exercícios para Vestibular',
            'enem': 'Exercícios do ENEM'
        };
        return titles[category] || 'Exercícios';
    }
    
    function getCategoryDescription(category) {
        const descriptions = {
            'natureza': 'Biologia, Química e Física',
            'humanas': 'História, Geografia, Filosofia e Sociologia',
            'exatas': 'Matemática, Física e Química',
            'linguagem': 'Português, Literatura e Línguas',
            'vestibular': 'Exercícios específicos para vestibulares',
            'enem': 'Questões do ENEM e simulados'
        };
        return descriptions[category] || 'Lista de exercícios disponíveis';
    }
    
    // Botões de iniciar exercício
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('iniciar-exercicio')) {
            const exerciseTitle = e.target.closest('.exercise-item').querySelector('.exercise-title').textContent;
            alert(`Iniciando exercício: ${exerciseTitle}\n\nEsta funcionalidade carregará o exercício específico.`);
            
            // Simular conclusão de exercício para atualizar estatísticas
            simulateExerciseCompletion();
        }
    });
    
    // Botões de simulado
    const simuladoButtons = document.querySelectorAll('.card-simulado .btn-primary');
    simuladoButtons.forEach(button => {
        button.addEventListener('click', function() {
            const simuladoTitle = this.closest('.card-simulado').querySelector('h4').textContent;
            alert(`Iniciando: ${simuladoTitle}\n\nEsta funcionalidade carregará o simulado.`);
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
    async function initializeApp() {
        loadStudyTime();
        loadProgressStats();
        carregarConfiguracoes();
        
        // Inicializar banco de dados
        await initDatabase();
        
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