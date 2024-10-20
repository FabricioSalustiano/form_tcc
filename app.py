from flask import Flask, render_template, request, jsonify
import joblib
import numpy as np
import pandas as pd

modelo = joblib.load('modelo_random_forest.pkl')
encoder = joblib.load('encoder_onehot.pkl')

app = Flask(__name__)

def convert_age_range_to_value(age_range):
    if age_range == "0-18":
        return 9
    elif age_range == "19-30":
        return 24.5
    elif age_range == "31-50":
        return 40.5
    elif age_range == "51-70":
        return 60.5
    elif age_range == "71+":
        return 75
    return 0

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.json
        uf = data['UF']
        faixa_etaria = data['Faixa_etária_da_vítima']
        genero_vitima = data['Gênero_da_vítima']
        profissao_suspeito = data['Profissão_do_suspeito']
        relacao = data['Relação_vítima_suspeito']
        historico_violencia = int(data['Histórico_de_violência'])
        quantidade_vitimas = int(data['sl_quantidade_vitimas'])
        
        faixa_etaria_numerica = convert_age_range_to_value(faixa_etaria)

        input_data = pd.DataFrame({
            'UF': [uf],
            'Faixa_etária_da_vítima': [faixa_etaria_numerica],
            'Gênero_da_vítima': [genero_vitima],
            'Profissão_do_suspeito': [profissao_suspeito],
            'Relação_vítima_suspeito': [relacao],
            'sl_quantidade_vitimas': [quantidade_vitimas],
            'Histórico_de_violência': [historico_violencia]
        })

        colunas_categoricas = ['UF', 'Gênero_da_vítima', 'Profissão_do_suspeito', 'Relação_vítima_suspeito']
        dados_categorizados = encoder.transform(input_data[colunas_categoricas])
        if hasattr(dados_categorizados, 'toarray'):
           dados_categorizados = dados_categorizados.toarray()
        
        dados_numericos = input_data[['Faixa_etária_da_vítima', 'sl_quantidade_vitimas']]
        
        features = np.concatenate([dados_numericos.values, dados_categorizados], axis=1)

        if features.shape[1] != modelo.n_features_in_:
            raise ValueError(f"Número de características inesperado: {features.shape[1]}, esperado: {modelo.n_features_in_}")

        predicao = modelo.predict(features)
        resultado = 'baixo' if predicao[0] == 0 else 'médio' if predicao[0] == 1 else 'alto'

        return jsonify({'predicao': resultado})

    except Exception as e:
        print(f"Erro no servidor: {e}")
        return jsonify({'error': 'Erro ao processar a solicitação.'}), 500

if __name__ == '__main__':
    app.run(debug=True)
