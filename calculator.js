class Calculator {
    constructor() {
        this.display = document.querySelector('.display');
        this.historyDisplay = document.querySelector('.history-display');
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.shouldResetDisplay = false;
        this.memory = [];
        this.history = [];
        this.isRadians = false;
        this.currentMode = 'standard';
        this.numberBase = 'DEC';
        this.statisticsData = [];
        
        this.initializeEventListeners();
        this.updateModeDisplay();
    }

    initializeEventListeners() {
        // Number and operator buttons
        document.querySelectorAll('.number').forEach(button => {
            button.addEventListener('click', () => this.handleNumber(button.textContent));
        });

        document.querySelectorAll('.operator').forEach(button => {
            button.addEventListener('click', () => this.handleOperator(button.textContent));
        });

        // Scientific functions
        document.querySelectorAll('.scientific').forEach(button => {
            button.addEventListener('click', () => this.handleScientific(button.textContent));
        });

        // Programmer functions
        document.querySelectorAll('.programmer').forEach(button => {
            button.addEventListener('click', () => this.handleProgrammer(button.textContent));
        });

        // Statistics functions
        document.querySelectorAll('.statistics').forEach(button => {
            button.addEventListener('click', () => this.handleStatistics(button.textContent));
        });

        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(button => {
            button.addEventListener('click', () => this.setMode(button.dataset.mode));
        });

        // Settings
        document.getElementById('angleMode').addEventListener('click', () => this.toggleAngleMode());
        document.getElementById('historyBtn').addEventListener('click', () => this.toggleHistoryPanel());
        document.getElementById('memoryBtn').addEventListener('click', () => this.toggleMemoryPanel());

        // Memory operations
        document.querySelector('.memory-store').addEventListener('click', () => this.storeMemory());
        document.querySelector('.memory-recall').addEventListener('click', () => this.recallMemory());
        document.querySelector('.memory-clear').addEventListener('click', () => this.clearMemory());

        // History operations
        document.querySelector('.clear-history').addEventListener('click', () => this.clearHistory());

        // Basic operations
        document.querySelector('.equals').addEventListener('click', () => this.calculate());
        document.querySelector('.clear').addEventListener('click', () => this.clear());
        document.querySelector('.decimal').addEventListener('click', () => this.handleDecimal());

        // Keyboard support
        document.addEventListener('keydown', (e) => this.handleKeyboardInput(e));
    }

    setMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        // Show/hide mode-specific buttons
        document.querySelectorAll('.scientific').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'scientific');
        });
        document.querySelectorAll('.programmer').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'programmer');
        });
        document.querySelectorAll('.statistics').forEach(btn => {
            btn.classList.toggle('hidden', mode !== 'statistics');
        });

        this.updateModeDisplay();
    }

    toggleAngleMode() {
        this.isRadians = !this.isRadians;
        document.getElementById('angleMode').textContent = this.isRadians ? 'RAD' : 'DEG';
    }

    handleScientific(func) {
        const value = parseFloat(this.currentValue);
        let result;

        switch (func) {
            case 'sin':
                result = this.isRadians ? Math.sin(value) : Math.sin(value * Math.PI / 180);
                break;
            case 'cos':
                result = this.isRadians ? Math.cos(value) : Math.cos(value * Math.PI / 180);
                break;
            case 'tan':
                result = this.isRadians ? Math.tan(value) : Math.tan(value * Math.PI / 180);
                break;
            case 'sin⁻¹':
                result = this.isRadians ? Math.asin(value) : Math.asin(value) * 180 / Math.PI;
                break;
            case 'cos⁻¹':
                result = this.isRadians ? Math.acos(value) : Math.acos(value) * 180 / Math.PI;
                break;
            case 'tan⁻¹':
                result = this.isRadians ? Math.atan(value) : Math.atan(value) * 180 / Math.PI;
                break;
            case 'log':
                result = Math.log10(value);
                break;
            case 'ln':
                result = Math.log(value);
                break;
            case '√':
                result = Math.sqrt(value);
                break;
            case 'x²':
                result = Math.pow(value, 2);
                break;
            case 'x^y':
                this.operation = '^';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'π':
                result = Math.PI;
                break;
            case 'e':
                result = Math.E;
                break;
            case 'n!':
                result = this.factorial(value);
                break;
            case '1/x':
                result = 1 / value;
                break;
            case '|x|':
                result = Math.abs(value);
                break;
            case 'e^x':
                result = Math.exp(value);
                break;
            case '10^x':
                result = Math.pow(10, value);
                break;
            default:
                return;
        }

        this.currentValue = this.formatResult(result);
        this.updateDisplay();
        this.addToHistory(`${func}(${value}) = ${this.currentValue}`);
    }

    handleProgrammer(func) {
        const value = parseInt(this.currentValue);
        let result;

        switch (func) {
            case 'HEX':
                this.currentValue = value.toString(16).toUpperCase();
                break;
            case 'DEC':
                this.currentValue = value.toString(10);
                break;
            case 'OCT':
                this.currentValue = value.toString(8);
                break;
            case 'BIN':
                this.currentValue = value.toString(2);
                break;
            case 'AND':
                this.operation = '&';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'OR':
                this.operation = '|';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'XOR':
                this.operation = '^';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case 'NOT':
                result = ~value;
                break;
            case '<<':
                this.operation = '<<';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
            case '>>':
                this.operation = '>>';
                this.previousValue = this.currentValue;
                this.shouldResetDisplay = true;
                return;
        }

        if (result !== undefined) {
            this.currentValue = result.toString();
        }
        this.updateDisplay();
    }

    handleStatistics(func) {
        switch (func) {
            case 'DATA':
                this.statisticsData.push(parseFloat(this.currentValue));
                this.addToHistory(`Added ${this.currentValue} to dataset`);
                this.currentValue = '0';
                break;
            case 'MEAN':
                this.currentValue = this.calculateMean().toString();
                break;
            case 'MED':
                this.currentValue = this.calculateMedian().toString();
                break;
            case 'STD':
                this.currentValue = this.calculateStdDev().toString();
                break;
            case 'VAR':
                this.currentValue = this.calculateVariance().toString();
                break;
            case 'MIN':
                this.currentValue = Math.min(...this.statisticsData).toString();
                break;
            case 'MAX':
                this.currentValue = Math.max(...this.statisticsData).toString();
                break;
            case 'SUM':
                this.currentValue = this.statisticsData.reduce((a, b) => a + b, 0).toString();
                break;
        }
        this.updateDisplay();
    }

    calculateMean() {
        return this.statisticsData.reduce((a, b) => a + b, 0) / this.statisticsData.length;
    }

    calculateMedian() {
        const sorted = [...this.statisticsData].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
    }

    calculateVariance() {
        const mean = this.calculateMean();
        return this.statisticsData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.statisticsData.length;
    }

    calculateStdDev() {
        return Math.sqrt(this.calculateVariance());
    }

    factorial(n) {
        if (n < 0) return NaN;
        if (n <= 1) return 1;
        let result = 1;
        for (let i = 2; i <= n; i++) {
            result *= i;
        }
        return result;
    }

    storeMemory() {
        this.memory.push(this.currentValue);
        this.updateMemoryPanel();
    }

    recallMemory() {
        if (this.memory.length > 0) {
            this.currentValue = this.memory[this.memory.length - 1];
            this.updateDisplay();
        }
    }

    clearMemory() {
        this.memory = [];
        this.updateMemoryPanel();
    }

    addToHistory(entry) {
        this.history.push(entry);
        this.updateHistoryPanel();
    }

    clearHistory() {
        this.history = [];
        this.updateHistoryPanel();
    }

    updateHistoryPanel() {
        const historyContent = document.querySelector('.history-content');
        historyContent.innerHTML = this.history.map(entry => 
            `<div class="history-item">${entry}</div>`
        ).join('');
    }

    updateMemoryPanel() {
        const memoryContent = document.querySelector('.memory-content');
        memoryContent.innerHTML = this.memory.map((value, index) => 
            `<div class="memory-item">M${index + 1}: ${value}</div>`
        ).join('');
    }

    toggleHistoryPanel() {
        document.querySelector('.history-panel').classList.toggle('hidden');
    }

    toggleMemoryPanel() {
        document.querySelector('.memory-panel').classList.toggle('hidden');
    }

    calculate() {
        if (this.previousValue === null) return;

        const prev = parseFloat(this.previousValue);
        const current = parseFloat(this.currentValue);
        let result;

        try {
            switch (this.operation) {
                case '+': result = prev + current; break;
                case '-': result = prev - current; break;
                case '×': result = prev * current; break;
                case '÷': 
                    if (current === 0) throw new Error('Division by zero');
                    result = prev / current; 
                    break;
                case '^': result = Math.pow(prev, current); break;
                case '&': result = prev & current; break;
                case '|': result = prev | current; break;
                case '<<': result = prev << current; break;
                case '>>': result = prev >> current; break;
                default: return;
            }

            this.currentValue = this.formatResult(result);
            this.addToHistory(`${prev} ${this.operation} ${current} = ${this.currentValue}`);
            this.previousValue = null;
            this.operation = null;
            this.updateDisplay();
        } catch (error) {
            this.display.textContent = 'Error';
            this.clear();
        }
    }

    formatResult(result) {
        let formatted = result.toString();
        
        if (formatted.length > 10) {
            formatted = parseFloat(result).toExponential(5);
        }
        
        if (formatted.includes('.')) {
            formatted = formatted.replace(/\.?0+$/, '');
        }
        
        return formatted;
    }

    clear() {
        this.currentValue = '0';
        this.previousValue = null;
        this.operation = null;
        this.updateDisplay();
    }

    updateDisplay() {
        this.display.textContent = this.currentValue;
    }

    handleKeyboardInput(e) {
        if (e.key >= '0' && e.key <= '9') {
            this.handleNumber(e.key);
        } else if (['+', '-', '*', '/', '^', '&', '|'].includes(e.key)) {
            this.handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
        } else if (e.key === 'Enter' || e.key === '=') {
            this.calculate();
        } else if (e.key === 'Escape') {
            this.clear();
        } else if (e.key === '.') {
            this.handleDecimal();
        }
    }
}

// Initialize the calculator when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new Calculator();
}); 