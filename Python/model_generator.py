import spacy
import json
from spacy.training.example import Example
from spacy.util import minibatch
import re

# Load a blank NLP model
nlp = spacy.blank("en")

# Add NER to the pipeline
ner = nlp.add_pipe("ner")

# Add labels
labels = ["amount", "account", "transaction_type", "info"]
for label in labels:
    ner.add_label(label)

# Prepare training data
def validate_sender(mess):
    for sender in ['AxisBk', 'AxisBK', 'ICICIB', 'ICICIT', 'BOBTXN', 'HDFCBK', 'AXISBK', 'IPBMSG', 'BOBSMS']:
        if sender in mess["address"]:
            return True
    return False

def extract_using_rules(message):
    patterns = {
        "amount": r"(?:rs\.?|₹|\$|eur|gbp|inr)\s*\d{1,3}(?:,\d{2,3})*(?:\.\d{1,2})?",
        "account": r"(?:a/c|account|acct|card|a/c no\.|a/c no|from HDFC Bank|card ending|acc|account no)\s+(?:\*+|X+|\.+)?(\d+)",
        "transaction_type": r"(credited|debited|withdrawn|transfer)",
        "date": r"\d{1,2}(?:-|/)(?:\d{2}|[a-zA-Z]{3})(?:-|/)\d{2,4}",  # Matches "12-Nov-2023"
        "info": r"(?:thru UPI|info| to |towards|UPI Ref no|at |from|UPI|IMPS)([^.]+)"
    }
    details = []
    match_state=False
    for key, pattern in patterns.items():
        if "requested money" in message or "Reward Points credited" in message or "Attention!" in message or "AutoPay" in message or "NEFT" in message:
            continue
        if key=="account" and  "Dear BOB UPI User" in message:
            details.append((5,16, "ACCOUNT"))
            continue
        match = re.search(pattern, message, re.IGNORECASE)
        if match == None: 
            match_state=True
            if key =="date":
                match_state=False
                continue
        details.append((match.start() if match else None, match.end() if match else None, key.upper()))
    if match_state:
        print(message)
        print(details)

    return (message, {"entities":details})

with open(r'Python\sms_list.json', 'rb') as file:
    input_sms = json.load(file)
    messages = [extract_using_rules(x["body"]) for x in input_sms if validate_sender(x)]

print(extract_using_rules("Rs.23000 Credited to A/c ...5032 thru UPI/432504633758 by sraven6r_okaxis. Total Bal:Rs.206493.62CR. Avlbl Amt:Rs.206493.62(20-11-2024 09:06:16) - Bank of Baroda"))
TRAIN_DATA = messages

# Training
failed_mess = []
optimizer = nlp.begin_training()
for epoch in range(10):  # Iterate over epochs
    losses = {}
    batches = minibatch(TRAIN_DATA, size=8)
    for batch in batches:
        for text, annotations in batch:
            try:
                example = Example.from_dict(nlp.make_doc(text), annotations)
                nlp.update([example], losses=losses)
            except Exception as e:
                failed_mess.append(text)
                print(e)
                
    print("Losses", losses)
print(failed_mess)
print(len(messages))
print(len(failed_mess))
# Save the model
nlp.to_disk("banking_sms_model")



"""
# Load the model
nlp = spacy.load("banking_sms_model")

# Predict on new messages
message = "Rs.2000 Debited to A/c ...5032 AT POS TID-95037628/P,ref-325607452871. Total Bal:Rs.2024.76CR. Avlbl Amt:Rs.2024.76(13-09-2023 07:54:32). Not you? Call 18005700-BOB"
doc = nlp(message)

# Extract entities
extracted = {ent.label_: ent.text for ent in doc.ents}
print(extracted)
"""