document.getElementById('formulario').addEventListener('submit', function(event) {
    event.preventDefault();

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
            const resultadoDiv = document.getElementById('resultado');
            resultadoDiv.classList.remove('verde', 'amarelo', 'vermelho');

            if (result.predicao === 'baixo') {
                resultadoDiv.classList.add('verde');
                resultadoDiv.textContent = 'Estado: BAIXO RISCO';
            } else if (result.predicao === 'medio') {
                resultadoDiv.classList.add('amarelo');
                resultadoDiv.textContent = 'Estado: MÉDIO RISCO';
            } else if (result.predicao === 'alto') {
                resultadoDiv.classList.add('vermelho');
                resultadoDiv.textContent = 'Estado: ALTO RISCO';
            }

            resultadoDiv.style.display = 'block';
        }
    })
    .catch(error => {
        console.error('Erro:', error);
    });
});