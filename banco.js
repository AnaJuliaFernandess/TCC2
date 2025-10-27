// ========== SISTEMA SQLITE PARA QUESTÕES ==========
let db = null;

// Inicializar o banco de dados
async function initDatabase() {
    try {
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
    
    // Tabela de progresso do usuário
    db.run(`
        CREATE TABLE IF NOT EXISTS user_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question_id INTEGER,
            user_answer TEXT,
            is_correct BOOLEAN,
            time_spent INTEGER,
            completed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (question_id) REFERENCES questions (id)
        )
    `);
}

// Inserir questões de exemplo
function insertSampleQuestions() {
    // Verificar se já existem questões para não duplicar
    const count = db.exec("SELECT COUNT(*) as count FROM questions");
    if (count[0].values[0][0] > 0) return;
    
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
            // Adicione mais questões aqui...
        ];
        localStorage.setItem('quiz_questions', JSON.stringify(defaultQuestions));
    }
}

// ========== FUNÇÕES PARA MANIPULAR QUESTÕES ==========

// Buscar questões por categoria
function getQuestionsByCategory(categoryId) {
    try {
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

// Buscar todas as categorias
function getAllCategories() {
    try {
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

// Inserir nova questão
function insertQuestion(questionData) {
    try {
        const { category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, subject, grade_level, time_estimate } = questionData;
        
        db.run(`
            INSERT INTO questions 
            (category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, subject, grade_level, time_estimate) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [category_id, question_text, option_a, option_b, option_c, option_d, correct_answer, explanation, difficulty, subject, grade_level, time_estimate]);
        
        return { success: true, message: 'Questão inserida com sucesso!' };
    } catch (error) {
        console.error('Erro ao inserir questão:', error);
        return { success: false, message: 'Erro ao inserir questão: ' + error.message };
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

// ========== INTERFACE PARA INSERIR QUESTÕES ==========

function showQuestionInsertForm() {
    const container = document.getElementById('quiz-interface');
    container.innerHTML = `
        <div class="question-form">
            <h3>Adicionar Nova Questão</h3>
            <form id="questionForm">
                <div class="mb-3">
                    <label class="form-label">Categoria:</label>
                    <select class="form-select" id="categorySelect" required>
                        <option value="">Selecione uma categoria</option>
                    </select>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Questão:</label>
                    <textarea class="form-control" id="questionText" rows="3" required></textarea>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Opção A:</label>
                        <input type="text" class="form-control" id="optionA" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Opção B:</label>
                        <input type="text" class="form-control" id="optionB" required>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Opção C:</label>
                        <input type="text" class="form-control" id="optionC" required>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Opção D:</label>
                        <input type="text" class="form-control" id="optionD" required>
                    </div>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-4">
                        <label class="form-label">Resposta Correta:</label>
                        <select class="form-select" id="correctAnswer" required>
                            <option value="">Selecione</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="D">D</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Dificuldade:</label>
                        <select class="form-select" id="difficulty" required>
                            <option value="facil">Fácil</option>
                            <option value="medio">Médio</option>
                            <option value="dificil">Difícil</option>
                        </select>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label">Matéria:</label>
                        <input type="text" class="form-control" id="subject" required>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Explicação:</label>
                    <textarea class="form-control" id="explanation" rows="2"></textarea>
                </div>
                
                <div class="row mb-3">
                    <div class="col-md-6">
                        <label class="form-label">Nível de Ensino:</label>
                        <input type="text" class="form-control" id="gradeLevel" placeholder="Ex: Fundamental, Médio">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">Tempo Estimado:</label>
                        <input type="text" class="form-control" id="timeEstimate" placeholder="Ex: 5 minutos">
                    </div>
                </div>
                
                <button type="submit" class="btn btn-success">Adicionar Questão</button>
                <button type="button" class="btn btn-secondary" onclick="showQuizCategories()">Voltar</button>
            </form>
        </div>
    `;
    
    loadCategoriesIntoSelect();
    setupQuestionForm();
}

function loadCategoriesIntoSelect() {
    const categories = getAllCategories();
    const select = document.getElementById('categorySelect');
    
    categories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}

function setupQuestionForm() {
    document.getElementById('questionForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const questionData = {
            category_id: parseInt(document.getElementById('categorySelect').value),
            question_text: document.getElementById('questionText').value,
            option_a: document.getElementById('optionA').value,
            option_b: document.getElementById('optionB').value,
            option_c: document.getElementById('optionC').value,
            option_d: document.getElementById('optionD').value,
            correct_answer: document.getElementById('correctAnswer').value,
            explanation: document.getElementById('explanation').value,
            difficulty: document.getElementById('difficulty').value,
            subject: document.getElementById('subject').value,
            grade_level: document.getElementById('gradeLevel').value,
            time_estimate: document.getElementById('timeEstimate').value
        };
        
        const result = insertQuestion(questionData);
        
        if (result.success) {
            alert('Questão adicionada com sucesso!');
            this.reset();
        } else {
            alert('Erro: ' + result.message);
        }
    });
}

// ========== ATUALIZAÇÃO DO SISTEMA DE QUIZ ==========

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
            
            <!-- Botão para adicionar novas questões -->
            <div class="col-md-4 mb-4">
                <div class="quiz-category add-question-btn" onclick="showQuestionInsertForm()">
                    <div class="quiz-icon">
                        <i class="fas fa-plus fa-3x"></i>
                    </div>
                    <h4>Adicionar Questões</h4>
                    <p>Crie suas próprias questões</p>
                    <span class="badge bg-success">Novo</span>
                </div>
            </div>
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
    
    showQuizInterface();
    loadQuestion();
}

function loadQuestion() {
    if (!currentQuiz) return;
    
    const question = currentQuiz.questions[currentQuiz.currentQuestionIndex];
    const questionText = document.getElementById('question-text');
    const quizOptions = document.getElementById('quiz-options');
    
    questionText.textContent = question.question_text;
    
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
    
    // Atualizar progresso
    document.getElementById('current-question').textContent = currentQuiz.currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = currentQuiz.questions.length;
    
    // Atualizar estado dos botões
    document.getElementById('prev-question').disabled = currentQuiz.currentQuestionIndex === 0;
}