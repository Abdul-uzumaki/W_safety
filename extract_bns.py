import pandas as pd
import json
import os

# Load the BNS dataset
csv_path = 'c:/Users/saira/Documents/mask/W_safety/bns_sections.csv'
df = pd.read_csv(csv_path)

# Comprehensive keywords for women and child related issues
keywords = [
    'woman', 'female', 'wife', 'marriage', 'harassment', 'rape', 'stalking', 
    'voyeurism', 'modesty', 'miscarriage', 'dowry', 'cruelty', 'acid', 
    'disrobe', 'kidnapping', 'abduction', 'trafficking', 'intercourse', 'child'
]

# Filter sections
relevant_df = df[
    df['Section _name'].str.contains('|'.join(keywords), case=False, na=False) |
    df['Description'].str.contains('|'.join(keywords), case=False, na=False)
]

# Filter specifically for Chapter V or sections known to be relevant to women/children
# (Sections 63-99 are Chapter V: OF OFFENCES AGAINST WOMAN AND CHILD)
chapter_v = df[df['Chapter'] == '5']
relevant_df = pd.concat([relevant_df, chapter_v]).drop_duplicates(subset=['Section'])

issues = []
for idx, row in relevant_df.iterrows():
    section_name = str(row['Section _name']).lower()
    desc = str(row['Description']).lower()
    
    # Base steps
    steps = [
        "Visit the nearest Police Station to file an FIR under Section 173 of BNSS.",
        "A free copy of the FIR must be provided to you immediately.",
        "If the police refuse to register the FIR, you can approach the Superintendent of Police (SP) or a Magistrate."
    ]
    
    # Category-specific steps
    if any(k in section_name or k in desc for k in ['rape', 'harassment', 'stalking', 'voyeurism', 'modesty']):
        steps.insert(0, "A female police officer must record your statement at a place of your choice.")
        steps.append("Medical examination must be conducted with your consent by a female doctor.")
    
    if any(k in section_name or k in desc for k in ['workplace', 'employment']):
        steps.append("File a complaint with the Internal Committee (IC) of your organization.")
        steps.append("Use the SHe-Box (Sexual Harassment electronic Box) portal for online reporting.")
        
    if any(k in section_name or k in desc for k in ['dowry', 'cruelty', 'marriage']):
        steps.append("Contact a Protection Officer under the Domestic Violence Act.")
        steps.append("Call the women's helpline number 181 for immediate legal and social assistance.")

    if any(k in section_name or k in desc for k in ['cyber', 'internet', 'e-mail', 'electronic']):
        steps.append("Report the incident on the National Cyber Crime Reporting Portal (cybercrime.gov.in).")
        steps.append("Take screenshots of the offensive content and preserve the URL/Profile ID.")

    # Extract punishment if possible (basic attempt)
    punishment = "Refer to legal text for full details."
    if "punished with" in desc:
        start = desc.find("punished with")
        end = desc.find(".", start)
        if end != -1:
            punishment = desc[start:end].capitalize()

    issues.append({
        "id": f"bns_{row['Section']}",
        "label": row['Section _name'],
        "section": str(row['Section']),
        "description": row['Description'][:400] + ("..." if len(row['Description']) > 400 else ""),
        "punishment": punishment,
        "filingSteps": steps
    })

# Save as a JSON for the frontend
output_path = 'c:/Users/saira/Documents/mask/W_safety/frontend/src/services/bns_model.json'
with open(output_path, 'w') as f:
    json.dump(issues, f, indent=2)

print(f"Extraction complete. {len(issues)} relevant BNS sections identified and processed.")
