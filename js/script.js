const alertConfigs = {
    grave: {
        classe: 'alert_danger',
        mensagem: '<strong>URGENTE</strong>: Vítima em possível perigo de morte. Acione emergência!'
    },
    medio: {
        classe: 'alert_warning',
        mensagem: '<strong>ATENÇÃO</strong>: Verifique com atenção. A situação pode exigir acompanhamento.'
    },
    baixo: {
        classe: 'alert_info',
        mensagem: '<strong>ATENÇÃO</strong>: Acompanhe o caso com cautela. Não há urgência imediata.'
    }
};

let alerta = document.getElementById('alerta');
let mensagemAlerta = document.getElementById('mensagem-alerta');

function cadastrarOcorrencia(event) {
    event.preventDefault();

    setAlert('grave');

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
}

function limparClassesDeAlerta() {
    alerta.classList.remove('alert_danger', 'alert_warning', 'alert_info', 'alert_none');
}

function setAlert(gravidade) {
    limparClassesDeAlerta();
    
    const config = alertConfigs[gravidade];
    if (config) {
        alerta.classList.add(config.classe);
        mensagemAlerta.innerHTML = config.mensagem;
    }
}