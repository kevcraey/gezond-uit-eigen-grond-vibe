import { css } from 'lit';

export const wizardStyles = css`
    :host { display: block; }
    .wizard-content { margin-top: 2rem; }
    
    .suggestions-list {
        position: absolute;
        z-index: 1000;
        background: white;
        border: 1px solid #ccc;
        width: 100%;
        max-height: 200px;
        overflow-y: auto;
        list-style: none;
        padding: 0;
        margin: 0;
        margin-top: 2px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    .suggestion-item {
        padding: 10px;
        cursor: pointer;
        border-bottom: 1px solid #eee;
    }
    
    .suggestion-item:hover {
        background: #f0f0f0;
    }
    
    .address-input-wrapper {
        position: relative;
    }
    
    .results-section {
        margin-top: 3rem;
    }
    
    .step-results {
        margin-bottom: 2rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #e0e0e0;
    }
    
    .step-results > vl-title {
        margin-bottom: 0.25rem;
    }
    
    .address-subtitle {
        color: #666;
        font-style: italic;
        margin-bottom: 1rem;
    }
    
    .step-inline-results {
        margin-top: 2rem;
        padding-top: 1rem;
        border-top: 1px solid #e0e0e0;
        position: relative;
        z-index: 5;
        background-color: white;
        clear: both;
    }

    .map-container {
        height: 400px; 
        margin: 1rem 0; 
        position: relative;
        overflow: hidden; /* Fixes map overflow */
    }

    vl-map {
        width: 100%;
        height: 100%;
        display: block;
    }

    .action-group-container {
        margin-top: 1rem;
        position: relative;
        z-index: 10;
        background: white; /* Ensure it covers anything behind */
        clear: both;
    }
`;
