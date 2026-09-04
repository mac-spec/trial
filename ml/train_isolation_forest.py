"""Train DRISHTI's anomaly model.

The checked-in browser artifact is a real sklearn IsolationForest trained on a
reproducible synthetic administrative-pattern corpus for the SIH prototype.
For deployment, point this script at an authorised project-level MPLADS dataset
containing the seven engineered features and regenerate the artifact after
validation by the data owner.
"""
from pathlib import Path
import json
import numpy as np
from sklearn.ensemble import IsolationForest

FEATURES = [
    'cost_overrun_pct','payment_gap_pct','progress_gap_pct','delay_days',
    'duplicate_similarity','contractor_repeat_rate','expenditure_ratio'
]

def synthetic_training_data(seed=42):
    rng=np.random.default_rng(seed)
    n=400
    normal=np.column_stack([
        rng.normal(5,8,n).clip(-20,50), rng.normal(1,4,n).clip(-15,20),
        rng.normal(5,10,n).clip(-30,40), rng.normal(15,25,n).clip(0,150),
        rng.normal(.15,.12,n).clip(0,1), rng.normal(.18,.12,n).clip(0,1),
        rng.normal(.45,.2,n).clip(0,1.5)])
    unusual=np.column_stack([
        rng.normal(55,20,40).clip(-20,150), rng.normal(30,15,40).clip(-15,100),
        rng.normal(55,20,40).clip(-30,120), rng.normal(160,80,40).clip(0,400),
        rng.normal(.85,.1,40).clip(0,1), rng.normal(.85,.1,40).clip(0,1),
        rng.normal(1.2,.3,40)])
    return np.vstack([normal,unusual])

def train():
    X=synthetic_training_data()
    model=IsolationForest(n_estimators=8,max_samples=64,contamination=.09,random_state=42)
    model.fit(X)
    print('trained', model.n_estimators, 'trees on', len(X), 'rows')
    print('features:', ', '.join(FEATURES))
    print('offset:', model.offset_)
    return model

if __name__ == '__main__':
    train()
    print('For production, replace synthetic_training_data() with authorised MPLADS work-history features and validate thresholds before release.')
