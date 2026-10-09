"""Pure static constant parsing; never import/execute a prepared procedure."""
import ast,pathlib,json,hashlib,sys
HERE=pathlib.Path(__file__).resolve().parent
TARGET=pathlib.Path(sys.argv[1]) if len(sys.argv)==2 else HERE
def sha(b):return hashlib.sha256(b).hexdigest()
def constant(node,names):
    if isinstance(node,ast.Constant):return node.value
    if isinstance(node,ast.Name):return names[node.id]
    if isinstance(node,ast.Call) and isinstance(node.func,ast.Name) and node.func.id=='Path' and len(node.args)==1:return pathlib.Path(constant(node.args[0],names))
    if isinstance(node,ast.BinOp) and isinstance(node.op,ast.Div):return constant(node.left,names)/constant(node.right,names)
    raise ValueError('Unsupported literal expression')
def source_constant(file):
    tree=ast.parse(file.read_bytes(),filename=str(file));names={}
    for node in tree.body:
        if isinstance(node,ast.Assign) and len(node.targets)==1 and isinstance(node.targets[0],ast.Name):
            name=node.targets[0].id
            if name in ('SCRATCH','SOURCE','CONFIG_SHA'):names[name]=constant(node.value,names)
    return names
configraw=(TARGET/'CONFIG-PENDING.json').read_bytes();config=json.loads(configraw)
source=pathlib.Path(config['roles']['witnessSourcePins']['path']).parent
receipt_role=config['roles']['witnessSourceReview'];receiptraw=pathlib.Path(receipt_role['path']).read_bytes();assert sha(receiptraw)==receipt_role['sha256'];receipt=json.loads(receiptraw)
assert receipt['sourceDirectory']==str(source)
assert receipt['sourcePinsSha256']==config['roles']['witnessSourcePins']['sha256']==sha((source/'SOURCE-PINS.json').read_bytes())
for name in ('fill_actual_candidate.py','adopt_reviewed_candidate.py'):
    values=source_constant(TARGET/name)
    assert values['SOURCE']==source, name+' SOURCE disagrees with config/accepted receipt: '+str(values['SOURCE'])
    assert values['CONFIG_SHA']==sha(configraw),name+' CONFIG_SHA drift'
print(json.dumps({'status':'STATIC_SOURCE_CONSTANTS_MATCH','target':str(TARGET),'sourceDirectory':str(source),'sourcePinsSha256':receipt['sourcePinsSha256'],'configAndReceiptMatch':True,'proceduresImportedOrExecuted':False},sort_keys=True))
