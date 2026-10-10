# Parent argument-map source correction

The original scanner argv has phase at index8 and label at9. An author index error changed phase and left the old label in held R3. Preserve it as source STOP, and compare a corrected fresh map against the complete original argv with only the intended label changed. Independent review follows the corrected full source; no recorded runtime was attempted.
