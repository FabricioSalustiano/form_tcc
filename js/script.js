let totalTime = 5000;
let barraProgresso = document.getElementById('barraProgresso');
let alerta = document.getElementById('alerta');
let textoAlerta = document.getElementById('textoAlerta');
let mensagemAlerta = document.getElementById('mensagemAlerta');

let width = 0;
let interval;

function cadastrarOcorrencia(event) {
    event.preventDefault();

    setAlert('grave');

    
    const btnRegistrar = document.getElementById("btnRegistrar");
    const spinner = document.getElementById("spinner");
    const idade = document.getElementById('idade').value;
    const profissao = document.getElementById('profissao').value;
    const relacao_agressor = document.getElementById('relacao_agressor').value;
    const genero = document.getElementById('genero').value;
    const historico_violencia = document.getElementById('historico_violencia').value;

    const data = {
        'Faixa_etária_da_vítima': idade,
        'Profissão_do_suspeito': profissao,
        'Relação_vítima_suspeito': relacao_agressor,
        'Gênero_do_suspeito': genero,
        'Histórico_de_violência': historico_violencia
    };

    habilitarLoader(btnRegistrar, spinner);
    
    fetch('/predict', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.error) {
            console.error(result.error);
            alert('Ocorreu um erro: ' + result.error);
        } else {
            if (result.predicao === 'baixo') {
                setAlert('baixo');
            } else if (result.predicao === 'medio') {
                setAlert('medio');
            } else if (result.predicao === 'alto') {
                setAlert('grave');
            }
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });

    setTimeout(function() {
        desabilitarLoader(btnRegistrar, spinner);
    }, 1000);
}

function habilitarLoader(button, spinner) {
    button.disabled = true;
    spinner.style.display = "inline-block";
}

function desabilitarLoader(button, spinner) {
    button.disabled = false;
    spinner.style.display = "none";
}

function setAlert(gravidade) {
    let icon = document.querySelector('#alerta svg use');

    limparAlerta();

    switch (gravidade) {
        case 'grave':
            icon.setAttribute('xlink:href', '#exclamation-triangle-fill');
            alerta.classList.add('alert-danger');
            barraProgresso.classList.add('bg-danger');
            textoAlerta.innerHTML = 'URGENTE:';
            mensagemAlerta.innerHTML = 'Vítima em possivel perigo de morte. Acione emergência!'
            break;
        case 'medio':
            icon.setAttribute('xlink:href', '#info-fill');
            alerta.classList.add('alert-warning');
            barraProgresso.classList.add('bg-warning');
            textoAlerta.innerHTML = 'ATENÇÃO:';
            mensagemAlerta.innerHTML = 'Verifique com atenção. A situação pode exigir acompanhamento.';
            break;
        case 'baixo':
            icon.setAttribute('xlink:href', '#info-fill');
            alerta.classList.add('alert-info');
            barraProgresso.classList.add('bg-info');
            textoAlerta.innerHTML = 'ATENÇÃO:';
            mensagemAlerta.innerHTML = 'Acompanhe o caso com cautela. Não há urgência imediata.';
            break;
        default:
            break;
    }

    width = 0;
    barraProgresso.style.width = width + '%';
    barraProgresso.setAttribute('aria-valuenow', width);

    alerta.classList.add('show');

    habilitarBarraProgresso();
}

function habilitarBarraProgresso() {
    interval = setInterval(function() {
        width += 2;
        barraProgresso.style.width = width + '%';
        barraProgresso.setAttribute('aria-valuenow', width);
        
        if (width >= 100) {
            clearInterval(interval);
            alerta.classList.remove('show');
        }
    }, totalTime / 50);
}

function limparAlerta() {
    alerta.classList.remove('show');
    alerta.classList.remove('alert-danger', 'alert-warning', 'alert-info');
    barraProgresso.classList.remove('bg-danger', 'bg-warning', 'bg-info');

    textoAlerta.innerHTML = '';
    mensagemAlerta.innerHTML = '';
}

document.querySelector('.btn-close').addEventListener('click', function() {
    limparAlerta();
    clearInterval(interval);
});