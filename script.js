function init() {
    // Hide the things that should be hidden
    hideElement('natDiv');
    hideElement('portDiv');
    hideElement('icmpDiv');
    hideElement('ruleNumberDiv');

    // Clear output text area
    clearField('outputTextarea');
}

function ruleTypeOnChange() {
    // Determine the value of the dropdown
    const chainDatalist = document.getElementById('chains');
    const ruleTypeSelect = document.getElementById('ruleType');
    const ruleType = ruleTypeSelect.value;

    if (ruleType === 'nat') {

        // Change hidden states
        hideElement('actionDiv');
        showElement('natDiv');

        // Remove old options
        chainDatalist.children[0].remove();
        chainDatalist.children[0].remove();
        chainDatalist.children[0].remove();

        // Add new options
        chainDatalist.appendChild(new Option('PREROUTING', 'PREROUTING'))
        chainDatalist.appendChild(new Option('POSTROUTING', 'POSTROUTING'))
    } else if (ruleType === 'firewall') {
        // Change hidden states
        hideElement('natDiv');
        showElement('actionDiv');

        // Remove old options
        chainDatalist.children[0].remove();
        chainDatalist.children[0].remove();

        // Add new options
        chainDatalist.appendChild(new Option('INPUT'))
        chainDatalist.appendChild(new Option('FORWARD'))
        chainDatalist.appendChild(new Option('OUTPUT'))
    }
}

function chainOnChange() {
    const natDiv = document.getElementById('natDiv');
    const ruleType = document.getElementById('ruleType');

    // Show/hide nat field
    ruleType.value === 'nat' ? showElement('natDiv') : hideElement('natDiv');

    // Change 'New Destination' to 'New Source' in 'nat' field
    const nat = document.getElementById('nat');
    const natLabel = document.getElementById('natLabel');
    const chain = document.getElementById('chain');

    nat.placeholder = chain.value === 'PREROUTING' ? 'Enter new destination addr' : 'Enter new source addr';
    natLabel.innerHTML = chain.value === 'PREROUTING' ? 'New Destination' : 'New Source';
    clearField('nat');
}

function aDeleteOnChange() {
    const aDelete = document.getElementById('aDelete');

    // Show/hide rule number field
    /INSERT|DELETE/.test(aDelete.value) ? showElement('ruleNumberDiv', 'block') : hideElement('ruleNumberDiv');
}

function protocolOnChange() {
    const protocol = document.getElementById('protocol');

    // Show source and destination ports
    /TCP|UDP/.test(protocol.value) ? showElement('portDiv') : hideElement('portDiv');

    // Show ICMP Type and ICMP Reject With
    /ICMP/.test(protocol.value) ? showElement('icmpDiv') : hideElement('icmpDiv');
}

// todo clearOnClick function
function clearOnClick() {
    clearField('nat');
    clearField('sourceIP');
    clearField('destinationIP');
    clearField('sourcePort');
    clearField('destinationPort');
    clearField('icmpType');
    clearField('rejectWithICMP');
    clearField('inInterface');
    clearField('outInterface');
}
function generateIptablesSyntax() {
    // Reset error messages
    document.getElementById('sourceIPError').textContent = '';
    document.getElementById('destinationIPError').textContent = '';
    document.getElementById('sourcePortError').textContent = '';
    document.getElementById('destinationPortError').textContent = '';
    document.getElementById('natError').textContent = '';
    document.getElementById('chainError').textContent = '';
    document.getElementById('actionError').textContent = '';

    // Get values from inputs
    const ruleType = document.getElementById('ruleType').value;
    const chain = document.getElementById('chain').value;
    const Adelete = document.getElementById('aDelete').value;
    const ruleNum = document.getElementById('ruleNumber').value;
    const sourceIP = document.getElementById('sourceIP').value;
    const destinationIP = document.getElementById('destinationIP').value;
    const sourcePort = document.getElementById('sourcePort').value;
    const destinationPort = document.getElementById('destinationPort').value;
    const protocol = document.getElementById('protocol').value;
    const inInterface = document.getElementById('inInterface').value;
    const outInterface = document.getElementById('outInterface').value;
    const icmpType = document.getElementById('icmpType').value;
    const rejectWithICMP = document.getElementById('rejectWithICMP').value;
    const action = document.getElementById('action').value;
    const natIP = document.getElementById('nat').value;
    const sudo = document.getElementById('sudo').checked;

    // Create the syntax for the states
    const newCheck = document.getElementById('new');
    const establishedCheck = document.getElementById('established');
    const relatedCheck = document.getElementById('related');
    const invalidCheck = document.getElementById('invalid');

    let state = [];
    if (newCheck.checked) state.push('NEW');
    if (establishedCheck.checked) state.push('ESTABLISHED');
    if (relatedCheck.checked) state.push('RELATED');
    if (invalidCheck.checked) state.push('INVALID');

    let stateStr = '';
    for (let i = 0; i < state.length; i++) {
        stateStr += state[i] + ',';
    }
    stateStr = stateStr.slice(0,-1);

    // Validate inputs
    if (sourceIP && !isValidIP(sourceIP)) {
        document.getElementById('sourceIPError').textContent = 'Invalid Source IP Address';
        return;
    }

    if (destinationIP && !isValidIP(destinationIP)) {
        document.getElementById('destinationIPError').textContent = 'Invalid Destination IP Address';
        return;
    }

    if (sourcePort && !isValidPort(sourcePort)) {
        document.getElementById('sourcePortError').textContent = 'Invalid Source Port';
        return;
    }

    if (destinationPort && !isValidPort(destinationPort)) {
        document.getElementById('destinationPortError').textContent = 'Invalid Destination Port';
        return;
    }

    if (natIP && !isValidIP(natIP)) {
        document.getElementById('dsnatError').textContent = 'Invalid IP';
        return;
    }

    if (!chain) {
        document.getElementById('chainError').textContent = 'You must specify a chain';
        return;
    }

    if (!action) {
        document.getElementById('actionError').textContent = 'You must specify an action';
        return;
    }

    // Constructing iptables syntax
    // (state ? `-m state --state ${state} ` : '') +
    // Displaying generated iptables syntax
    document.getElementById('outputTextarea').value = (sudo ? 'sudo ' : '') +
        'iptables -' + Adelete + ' ' + chain + ' ' +
        (ruleNum !== '0' ? `${ruleNum} ` : '') +
        (sourceIP ? `-s ${sourceIP} ` : '') +
        (destinationIP ? `-d ${destinationIP} ` : '') +
        (protocol !== 'ANY' ? `-p ${protocol} ` : '') +
        (sourcePort ? `--sport ${sourcePort} ` : '') +
        (destinationPort ? `--dport ${destinationPort} ` : '') +
        (inInterface ? `-i ${inInterface} ` : '') +
        (outInterface ? `-o ${outInterface} ` : '') +
        (icmpType && protocol.toLowerCase() === 'icmp' ? `--icmp-type ${icmpType} ` : '') +
        (rejectWithICMP ? `-j REJECT --reject-with icmp-${rejectWithICMP} ` : '') +
        (stateStr ? `-m state --state ${stateStr} ` : '') +
        (ruleType === 'firewall' ? `-j ${action}` : '') +
        (ruleType === 'nat' ? chain === 'PREROUTING' ? `-t nat -j DNAT --to-destination ${natIP}` : `-t nat -j SNAT --to-source ${natIP}` : '');
}

function isValidIP(ip) {
    return /\b(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\/(?:[0-9]|[1-2][0-9]|3[0-2])\b/.test(ip);
}

function isValidPort(ip) {
    return /\b(?:[1-9]\d{0,4}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])\b/.test(ip);
}