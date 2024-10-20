import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder
from sklearn.metrics import classification_report
import joblib

data = pd.read_csv('ligue180.csv')

print(data.head())
print(data.columns)

print(data.isnull().sum())

data['sl_quantidade_vitimas'] = data['sl_quantidade_vitimas'].fillna(data['sl_quantidade_vitimas'].mean())
data['Relação_vítima_suspeito'] = data['Relação_vítima_suspeito'].fillna(data['Relação_vítima_suspeito'].mode()[0])

X = data[['UF', 'Faixa_etária_da_vítima', 'Gênero_da_vítima', 
           'Profissão_do_suspeito', 'Relação_vítima_suspeito', 
           'sl_quantidade_vitimas']]
y = data['Denúncia_emergencial']

X.loc[:, 'Faixa_etária_da_vítima'] = X['Faixa_etária_da_vítima'].str.extract('(\d+)').astype(float)

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

categorical_features = ['UF', 'Gênero_da_vítima', 'Profissão_do_suspeito', 'Relação_vítima_suspeito']

encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
X_encoded_train = encoder.fit_transform(X_train[categorical_features])
X_encoded_test = encoder.transform(X_test[categorical_features])

X_train_encoded = pd.DataFrame(X_encoded_train, columns=encoder.get_feature_names_out(categorical_features))
X_test_encoded = pd.DataFrame(X_encoded_test, columns=encoder.get_feature_names_out(categorical_features))

X_train_final = pd.concat([X_train_encoded, X_train[['Faixa_etária_da_vítima', 'sl_quantidade_vitimas']].reset_index(drop=True)], axis=1)
X_test_final = pd.concat([X_test_encoded, X_test[['Faixa_etária_da_vítima', 'sl_quantidade_vitimas']].reset_index(drop=True)], axis=1)

modelo = RandomForestClassifier(random_state=42)
modelo.fit(X_train_final, y_train)

y_pred = modelo.predict(X_test_final)
print(classification_report(y_test, y_pred))

joblib.dump(modelo, 'modelo_random_forest.pkl')
joblib.dump(encoder, 'encoder_onehot.pkl')
