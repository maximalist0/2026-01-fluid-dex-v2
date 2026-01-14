# Decay limits

any new deposit that causes instant expansion WITHIN the current expand percentage, has its added availability reflected in there.
but if a new deposit causes instant expansion ABOVE the current expand percentage, then that new availability is immediately "absorbed".
the decay limit reflects this otherwise absorbed availability by decaying the excess deposit amount over e.g. 1 hour.

Protocols expect maximum expand percentage is maximum possible withdraw amount, but actual withdraw amount could be more because of
added decay. Protocols get this additional amount when splitting in multiple txs, each time max expansion is available as long as there
is decay amount.

Decay action process:
ON WITHDRAWALS: at the end of operation, take from decay amount first, reduce leftover decay duration
ON DEPOSITS: at the end of operation, whatever was effective excess not reflected in "withdrawable" amount -> add to decay amount

e.g. -> 100M supply, 20% expand, status 90% of expansion through, so 18% expansion ATM, so 18M withdrawable. (limit = 82M)

        -> DEPOSIT CASE A: PUSHING WITHIN FULL EXPANSION
        new deposit of 1M. new supply 101M, full expansion would be 20.2M (limit = 80.8M). Actual limit is 82M, withdrawable amount becomes
        19M (the deposited 1M expands instantly). No decay is added.

        -> DEPOSIT CASE B: PUSHING ABOVE FULL EXPANSION
        new deposit of 5M. new supply 105M, full expansion would be 21M (limit = 84M) + decaying limit must be 2M
        even with instant same withdrawal, the withdrawable amount stays the exact same at 18M afterwards, see withdrawal case A:

        -> WITHDRAWAL CASE A: MORE THAN DECAY AMOUNT (after deposit case B)
        instant withdrawal of 5M: new supply is 100M, 2M is taken from decay, 3M is taken from withdrawal limit, final withdrawal limit
        must end up at 82M again (which is not full expansion!) -> initial withdrawal limit of 84M is pushed down by 2M used from decay.

        -> WITHDRAWAL CASE B: WITHIN DECAY AMOUNT (after deposit case B)
        instant 1M withdrawal: new supply is 104M, limit is pushed down to full expansion while decay is available so to 104*0.8 = 83.2.
        withdrawable amount must end up 22M, so the 0.2M that the limit is not pushed down after full expansion must transfer to decay
        -> ending up with 1.2M decay and 20.8M from the limit. i.e. only the amount is taken from decay that is freed up as limit amount,
        the rest acts like excess deposit.

        when decay exists and expandPercent is updated (after deposit case B):
        -> CASE A: REDUCED from 20% to 15%
        supply 105M, 15% = 89.25M so 15.75M withdrawable. Ideally the 3M excess deposit that was represented in limit would be rolled
        over to decay depending on time passed, but there is no way to know. Admin only action so not a problem if some decay is "lost".

        -> CASE B: INCREASED from 20% to 25%
        supply 105M, 25% = 78.75M, so 26.25M withdrawable + the decay also still exists. Ideally, the 2M decay could be reduced depending
        on last excess deposit. Admin only action so not a problem if some decay is "lost".
