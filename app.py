import pandas as pd 
from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
from sklearn.calibration import LabelEncoder

modelo = joblib.load('modelo_random_forest.pkl')
encoder = joblib.load('encoder_onehot.pkl')

le_relacao = LabelEncoder()
le_genero = LabelEncoder()
le_profissao = LabelEncoder()

le_relacao.classes_ = np.array(['Conjuge', 'Ex-conjuge', 'Outro'])
le_genero.classes_ = np.array(['Masculino', 'Feminino'])  
le_profissao.classes_ = np.array(['Empregada', 'Desempregada'])

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json

        idade = int(data['Faixa_etária_da_vítima'])
        historico_violencia = int(data['Histórico_de_violência'])
        relacao = data['Relação_vítima_suspeito']
        genero = data['Gênero_do_suspeito']
        profissao = data['Profissão_do_suspeito']
        
        input_data = pd.DataFrame({
            'Faixa_etária_da_vítima': [idade],
            'Histórico_de_violência': [historico_violencia],
            'Relação_vítima_suspeito': [relacao],
            'Gênero_do_suspeito': [genero],
            'Profissão_do_suspeito': [profissao]
        })
        
        colunas_categoricas = ['Relação_vítima_suspeito', 'Gênero_do_suspeito', 'Profissão_do_suspeito']
        dados_categorizados = encoder.transform(input_data[colunas_categoricas])
        
        dados_numericos = input_data[['Faixa_etária_da_vítima', 'Histórico_de_violência']]
        features = np.concatenate([dados_numericos.values, dados_categorizados], axis=1)

        predicao = modelo.predict(features)
        
        if predicao == 0:
            resultado = 'baixo'
        elif predicao == 1:
            resultado = 'medio'
        else:
            resultado = 'alto'

        return jsonify({'predicao': resultado})
    
    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({'error': 'Erro ao processar a solicitação.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
