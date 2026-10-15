import json, urllib.request

API = 'http://localhost:4000'

def call(method, path, token=None, body=None):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(API + path, data=data, method=method)
    req.add_header('content-type', 'application/json')
    if token:
        req.add_header('authorization', 'Bearer ' + token)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read().decode())

def login(phone):
    return call('POST', '/auth/login', body={'phone': phone})[1]['token']

driver = login('+995599000301')
driver2 = login('+995599000302')
oper = login('+995599000100')
tech = login('+995599000101')
print('0. შესვლა — ოთხივე როლი ✓')

_, trucks = call('GET', '/trucks', driver)
truck = trucks[0]
print('1. მძღოლი ხედავს თავისი კომპანიის %d მანქანას, პირველი: %s %s' % (len(trucks), truck['plate'], truck['model']))

_, tri = call('POST', '/ai/triage', driver, {'text': 'უკნიდან ჰაერი გადის, შიშინებს'})
print('2. AI კითხულობს: %s' % tri['question'])
_, ans = call('POST', '/ai/answer', driver, {'symptomId': tri['symptomId'], 'label': tri['answers'][0]['label']})
print('   პასუხი: %s | ნაწილი: %s | %s' % (ans['title'], (ans['part'] or {}).get('name', '—'), ans['disclaimer']))

_, t = call('POST', '/tickets', driver, {'truckId': truck['id'], 'issue': 'უკანა ბორბალთან ჰაერი გადის', 'place': 'სენაკი, 34-ე კმ'})
tid = t['id']
print('3. თიქეთი № %s — ეტაპი: %s' % (t['number'], t['stage']))

_, techs = call('GET', '/techs', oper)
_, t = call('POST', '/tickets/%s/assign' % tid, oper, {'techId': techs[0]['id']})
print('4. ოპერატორმა მიაბა: %s → %s' % (t['tech']['name'], t['stage']))

call('POST', '/tickets/%s/stage' % tid, tech, {'stage': 'enroute'})
_, t = call('POST', '/tickets/%s/stage' % tid, tech, {'stage': 'onsite'})
print('5. ხელოსანმა მონიშნა: %s' % t['stage'])

_, parts = call('GET', '/parts?q=%D1%88%D0%BA%D0%BE%D1%80%D0%BD%D0%B8', tech)
_, parts = call('GET', '/parts', tech)
parts = [p for p in parts if 'შკორნი' in p['jargon']]
part = parts[0]
offer = part['offers'][0]
print('6. ჟარგონი „შკორნი“ → %s (%s) · იაფი: %s %s ₾%s' % (
    part['name'], part['oem'], offer['supplier'], offer['price'],
    '' if offer['verified'] else ' (ფასი დღეს არ გადამოწმებულა)'))

_, t = call('POST', '/tickets/%s/orders' % tid, tech, {'partId': part['id'], 'supplierId': offer['supplierId'], 'qty': 2, 'delivery': 'courier'})
print('7. შეკვეთა: %s — %s · ეტაპი: %s' % (t['orders'][0]['name'], t['orders'][0]['status'], t['stage']))

call('PATCH', '/tickets/%s' % tid, tech, {'hours': 2, 'note': 'ხუნდები შევცვალე, ჰაერი შევამოწმე.'})
_, t = call('POST', '/tickets/%s/stage' % tid, tech, {'stage': 'done'})
tot = t['totals']
print('8. ინვოისი იკრიბება:')
for l in tot['lines']:
    print('     %-34s %8.2f ₾' % (l['title'], l['sum']))
print('     %-34s %8.2f ₾' % ('დღგ 18%', tot['vat']))
print('     %-34s %8.2f ₾' % ('სულ', tot['gross']))

code, early = call('POST', '/tickets/%s/invoice' % tid, tech)
print('9. ხელოსანი ცდილობს ინვოისის გაგზავნას → %s %s' % (code, early.get('error')))

_, inv = call('POST', '/tickets/%s/invoice' % tid, oper)
print('10. ოპერატორმა გააგზავნა: ინვოისი %s — %.2f ₾, ხაზები: %d' % (inv['number'], inv['gross'], len(inv['lines'])))

code, again = call('POST', '/tickets/%s/invoice' % tid, oper)
print('11. მეორედ გაგზავნა → %s %s' % (code, again.get('error')))

code, forbidden = call('GET', '/tickets/%s' % tid, driver2)
print('12. სხვა კომპანიის მძღოლი ამ თიქეთს → %s %s' % (code, forbidden.get('error')))

_, mine = call('GET', '/tickets', tech)
print('13. ხელოსანი ხედავს მხოლოდ თავის %d თიქეთს' % len(mine))
_, all_ = call('GET', '/tickets', oper)
print('14. ოპერატორი ხედავს %d თიქეთს' % len(all_))
