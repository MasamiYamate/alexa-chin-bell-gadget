#
# Copyright 2019 Amazon.com, Inc. or its affiliates.  All Rights Reserved.
# These materials are licensed under the Amazon Software License in connection with the Alexa Gadgets Program.
# The Agreement is available at https://aws.amazon.com/asl/.
# See the Agreement for the specific terms and conditions of the Agreement.
# Capitalized terms not defined in this file have the meanings given to them in the Agreement.
#

import json
import logging
import sys
import threading
import signal
import time

from agt import AlexaGadget
from datetime import datetime

logging.basicConfig(stream=sys.stdout, level=logging.INFO)
logger = logging.getLogger(__name__)

class ChinBell(AlexaGadget):
    """
    An Alexa Gadget that cycles through colors using RGB LED and
    reports the color to the skill upon button press
    """

    def __init__(self):
        super().__init__()

    def on_custom_chinbell_start(self, directive):
        self.is_persistence_run = True
        self.is_time_check_run = True

        payload = json.loads(directive.payload.decode("utf-8"))
        logger.info(payload)
        # 終了時刻のUnixTimeを保持
        self.end_date = datetime.fromtimestamp(float(payload['date']) / 1000)

        self.session_persistence_thread = threading.Thread(target=self.session_persistence)
        self.session_persistence_thread.start()

        self.session_time_check_thread = threading.Thread(target=self.session_time_check)
        self.session_time_check_thread.start()

    def session_persistence(self):
        while self.is_persistence_run:
            logger.info("send")
            self.send_custom_event(
                'Custom.ChinBell', 'SkillHandler', {})
            time.sleep(30)

    def session_time_check(self):
        while self.is_time_check_run:
            now_date = datetime.now()
            remaining_time = self.end_date - now_date
            remaining_sec = remaining_time.total_seconds()
            logger.info("check")
            if remaining_sec <= 0:
                self.send_end_session()
                self.is_time_check_run = False
            # 毎秒確認する
            time.sleep(1)

    def send_end_session(self):
        self.is_persistence_run = False
        self.is_time_check_run = False

        payload = {"status": "end"}
        self.send_custom_event(
                'Custom.ChinBell', 'SkillHandler', payload)
        

if __name__ == '__main__':
    try:
        ChinBell().main()
    finally:
        logger.info("aaaaaaa")
