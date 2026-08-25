'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'

type Difficulty = 'Easy' | 'Medium' | 'Hard'

type Problem = {
  id: number
  title: string
  difficulty: Difficulty
  category: string
  description: string
  example: string
  expectedOutput: string
  starterCode: string
  tags: string[]
}

const problems: Problem[] = [
  {
    id: 1,
    title: '',
    difficulty: 'Easy',
    category: 'Arrays',
    description: 'A scanner records dock readings. Return the two positions whose values add exactly to the target.',
    example: 'readings = [4, 13, 6, 8], target = 14\nResult: [2, 3]',
    expectedOutput: '[2, 3]',
    starterCode: 'def find_pair(readings, target):\n    # Return the two positions whose readings add to target.\n    pass\n\nprint(find_pair([4, 13, 6, 8], 14))',
    tags: ['Arrays', 'Harbor Challenge'],
  },
  {
    id: 2,
    title: 'Turn the Signal Around',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'A navigation signal arrives as text. Return the signal with its characters in reverse order.',
    example: 'signal = \'NORTH\'\nResult: \'HTRON\'',
    expectedOutput: '\'HTRON\'',
    starterCode: 'def turn_signal(signal):\n    pass\n\nprint(turn_signal(\'NORTH\'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 3,
    title: 'Harbor Status Counter',
    difficulty: 'Easy',
    category: 'Loops',
    description: 'A list contains vessel statuses. Count how many vessels are marked \'ready\'.',
    example: 'statuses = [\'ready\', \'waiting\', \'ready\', \'offline\']\nResult: 2',
    expectedOutput: '2',
    starterCode: 'def count_ready(statuses):\n    pass\n\nprint(count_ready([\'ready\', \'waiting\', \'ready\', \'offline\']))',
    tags: ['Loops', 'Harbor Challenge'],
  },
  {
    id: 4,
    title: 'Read the Message Backward',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'A message is mirrored when it reads the same from both ends, ignoring case. Return True or False.',
    example: 'message = \'Radar\'\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def is_mirrored(message):\n    pass\n\nprint(is_mirrored(\'Radar\'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 5,
    title: 'Locate the Nearest Marker',
    difficulty: 'Medium',
    category: 'Searching',
    description: 'Given sorted marker positions and a requested position, return the index of the closest marker.',
    example: 'markers = [10, 20, 35, 50], target = 31\nResult: 2',
    expectedOutput: '2',
    starterCode: 'def nearest_marker(markers, target):\n    pass\n\nprint(nearest_marker([10, 20, 35, 50], 31))',
    tags: ['Searching', 'Harbor Challenge'],
  },
  {
    id: 6,
    title: 'Join Two Sorted Routes',
    difficulty: 'Medium',
    category: 'Arrays',
    description: 'Merge two already-sorted patrol routes into one sorted route without calling sort().',
    example: 'route_a = [2, 7, 12], route_b = [1, 5, 9]\nResult: [1, 2, 5, 7, 9, 12]',
    expectedOutput: '[1, 2, 5, 7, 9, 12]',
    starterCode: 'def merge_routes(route_a, route_b):\n    pass\n\nprint(merge_routes([2, 7, 12], [1, 5, 9]))',
    tags: ['Arrays', 'Harbor Challenge'],
  },
  {
    id: 7,
    title: 'Best Continuous Run',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'Find the largest total produced by any consecutive run of readings.',
    example: 'readings = [-2, 4, -1, 3, -5]\nResult: 6',
    expectedOutput: '6',
    starterCode: 'def best_run(readings):\n    pass\n\nprint(best_run([-2, 4, -1, 3, -5]))',
    tags: ['Dynamic Programming', 'Harbor Challenge'],
  },
  {
    id: 8,
    title: 'Balance the Dock Gates',
    difficulty: 'Medium',
    category: 'Stacks',
    description: 'Opening gates use \'(\' and closing gates use \')\'. Decide whether the sequence is correctly balanced.',
    example: 'layout = \'(()())\'\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def balanced_gates(layout):\n    pass\n\nprint(balanced_gates(\'(()())\'))',
    tags: ['Stacks', 'Harbor Challenge'],
  },
  {
    id: 9,
    title: 'Count the Climb Plans',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    description: 'A worker can climb one or two steps at a time. Return the number of distinct ways to reach the top.',
    example: 'steps = 5\nResult: 8',
    expectedOutput: '8',
    starterCode: 'def climb_plans(steps):\n    pass\n\nprint(climb_plans(5))',
    tags: ['Dynamic Programming', 'Harbor Challenge'],
  },
  {
    id: 10,
    title: 'Match the Longest Shared Route',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    description: 'Return the length of the longest subsequence shared by two route logs while preserving order.',
    example: 'route_a = \'ABCDGH\', route_b = \'AEDFHR\'\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def shared_route_length(route_a, route_b):\n    pass\n\nprint(shared_route_length(\'ABCDGH\', \'AEDFHR\'))',
    tags: ['Dynamic Programming', 'Harbor Challenge'],
  },
  {
    id: 11,
    title: 'Trace the Hidden Signal',
    difficulty: 'Hard',
    category: 'Backtracking',
    description: 'Trace a signal through adjacent grid cells without reusing a cell.',
    example: 'grid = [[\'C\',\'A\'], [\'T\',\'D\']], signal = \'CAT\'\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def trace_signal(grid, signal):\n    pass\n\nprint(trace_signal([[\'C\',\'A\'], [\'T\',\'D\']], \'CAT\'))',
    tags: ['Backtracking', 'Harbor Challenge'],
  },
  {
    id: 12,
    title: 'Measure the Trapped Water',
    difficulty: 'Hard',
    category: 'Arrays',
    description: 'Wall heights describe a landscape. Calculate how much water remains after rainfall.',
    example: 'walls = [0, 3, 0, 2, 0, 4]\nResult: 7',
    expectedOutput: '7',
    starterCode: 'def trapped_water(walls):\n    pass\n\nprint(trapped_water([0, 3, 0, 2, 0, 4]))',
    tags: ['Arrays', 'Harbor Challenge'],
  },
  {
    id: 13,
    title: 'Count Safe Berths',
    difficulty: 'Easy',
    category: 'Loops',
    description: 'Count safe berths without using list.count().',
    example: 'berths = [\'safe\', \'blocked\', \'safe\', \'safe\']\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def count_safe(berths):\n    pass\n\nprint(count_safe([\'safe\', \'blocked\', \'safe\', \'safe\']))',
    tags: ['Loops', 'Harbor Challenge'],
  },
  {
    id: 14,
    title: 'Normalize a Dock Label',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Trim a dock label and convert its letters to uppercase.',
    example: 'label = \'  north-7  \'\nResult: \'NORTH-7\'',
    expectedOutput: '\'NORTH-7\'',
    starterCode: 'def normalize_label(label):\n    pass\n\nprint(normalize_label(\'  north-7  \'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 15,
    title: 'Find the First Repeated Beacon',
    difficulty: 'Easy',
    category: 'Sets',
    description: 'Return the first beacon ID that appears for a second time.',
    example: 'beacons = [8, 3, 5, 3, 9]\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def first_repeat(beacons):\n    pass\n\nprint(first_repeat([8, 3, 5, 3, 9]))',
    tags: ['Sets', 'Harbor Challenge'],
  },
  {
    id: 16,
    title: 'Build a Cargo Manifest',
    difficulty: 'Easy',
    category: 'Dictionaries',
    description: 'Turn item/quantity pairs into one cargo manifest dictionary.',
    example: 'items = [(\'rope\', 4), (\'lamp\', 2)]\nResult: {\'rope\': 4, \'lamp\': 2}',
    expectedOutput: '{\'rope\': 4, \'lamp\': 2}',
    starterCode: 'def build_manifest(items):\n    pass\n\nprint(build_manifest([(\'rope\', 4), (\'lamp\', 2)]))',
    tags: ['Dictionaries', 'Harbor Challenge'],
  },
  {
    id: 17,
    title: 'Separate Even and Odd Readings',
    difficulty: 'Easy',
    category: 'Lists',
    description: 'Split readings into an even list and an odd list.',
    example: 'readings = [7, 2, 9, 4]\nResult: [[2, 4], [7, 9]]',
    expectedOutput: '[[2, 4], [7, 9]]',
    starterCode: 'def split_readings(readings):\n    pass\n\nprint(split_readings([7, 2, 9, 4]))',
    tags: ['Lists', 'Harbor Challenge'],
  },
  {
    id: 18,
    title: 'Rotate the Watch Schedule',
    difficulty: 'Easy',
    category: 'Lists',
    description: 'Move the final watch shift to the front while preserving all other order.',
    example: 'schedule = [\'A\', \'B\', \'C\', \'D\']\nResult: [\'D\', \'A\', \'B\', \'C\']',
    expectedOutput: '[\'D\', \'A\', \'B\', \'C\']',
    starterCode: 'def rotate_watch(schedule):\n    pass\n\nprint(rotate_watch([\'A\', \'B\', \'C\', \'D\']))',
    tags: ['Lists', 'Harbor Challenge'],
  },
  {
    id: 19,
    title: 'Choose the Heaviest Cargo',
    difficulty: 'Easy',
    category: 'Lists',
    description: 'Find the heaviest cargo without using max().',
    example: 'weights = [18, 7, 24, 11]\nResult: 24',
    expectedOutput: '24',
    starterCode: 'def heaviest(weights):\n    pass\n\nprint(heaviest([18, 7, 24, 11]))',
    tags: ['Lists', 'Harbor Challenge'],
  },
  {
    id: 20,
    title: 'Tally Crew Messages',
    difficulty: 'Easy',
    category: 'Dictionaries',
    description: 'Count word frequencies in a message without treating case as different.',
    example: 'message = \'Ready ready Wait\'\nResult: {\'ready\': 2, \'wait\': 1}',
    expectedOutput: '{\'ready\': 2, \'wait\': 1}',
    starterCode: 'def word_tally(message):\n    pass\n\nprint(word_tally(\'Ready ready Wait\'))',
    tags: ['Dictionaries', 'Harbor Challenge'],
  },
  {
    id: 21,
    title: 'Spot the Missing Marker',
    difficulty: 'Easy',
    category: 'Arrays',
    description: 'One integer is missing from the range 1 through n. Return it.',
    example: 'markers = [1, 4, 2, 5]\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def missing_marker(markers):\n    pass\n\nprint(missing_marker([1, 4, 2, 5]))',
    tags: ['Arrays', 'Harbor Challenge'],
  },
  {
    id: 22,
    title: 'Compress Repeated Signals',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Compress each consecutive run of identical characters into character-plus-count form.',
    example: 'signal = \'aaabbc\'\nResult: \'a3b2c1\'',
    expectedOutput: '\'a3b2c1\'',
    starterCode: 'def compress_signal(signal):\n    pass\n\nprint(compress_signal(\'aaabbc\'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 23,
    title: 'Merge Harbor Logs',
    difficulty: 'Medium',
    category: 'Arrays',
    description: 'Merge two timestamp-ordered harbor logs into one chronological log.',
    example: 'a = [(1,\'open\'), (4,\'load\')]\nb = [(2,\'scan\'), (3,\'seal\')]\nResult: [(1,\'open\'), (2,\'scan\'), (3,\'seal\'), (4,\'load\')]',
    expectedOutput: '[(1,\'open\'), (2,\'scan\'), (3,\'seal\'), (4,\'load\')]',
    starterCode: 'def merge_logs(a, b):\n    pass\n\nprint(merge_logs([(1,\'open\'), (4,\'load\')], [(2,\'scan\'), (3,\'seal\')]))',
    tags: ['Arrays', 'Harbor Challenge'],
  },
  {
    id: 24,
    title: 'Find the Quietest Window',
    difficulty: 'Medium',
    category: 'Sliding Window',
    description: 'Find the minimum total across any window of exactly k consecutive readings.',
    example: 'noise = [5, 2, 7, 1, 3, 4], k = 3\nResult: 8',
    expectedOutput: '8',
    starterCode: 'def quietest_window(noise, k):\n    pass\n\nprint(quietest_window([5, 2, 7, 1, 3, 4], 3))',
    tags: ['Sliding Window', 'Harbor Challenge'],
  },
  {
    id: 25,
    title: 'Schedule the Next Inspection',
    difficulty: 'Medium',
    category: 'Sorting',
    description: 'Order inspection jobs by their finishing time.',
    example: 'jobs = [(\'A\',5,2), (\'B\',1,5), (\'C\',3,1)]\nResult: [\'C\',\'A\',\'B\']',
    expectedOutput: '[\'C\', \'A\', \'B\']',
    starterCode: 'def next_inspection_order(jobs):\n    pass\n\nprint(next_inspection_order([(\'A\',5,2), (\'B\',1,5), (\'C\',3,1)]))',
    tags: ['Sorting', 'Harbor Challenge'],
  },
  {
    id: 26,
    title: 'Group Vessels by Destination',
    difficulty: 'Medium',
    category: 'Dictionaries',
    description: 'Group vessel names under their destination.',
    example: 'vessels = [(\'Aurora\',\'North\'), (\'Mira\',\'South\'), (\'Sol\',\'North\')]\nResult: grouped by destination',
    expectedOutput: '{\'North\': [\'Aurora\', \'Sol\'], \'South\': [\'Mira\']}',
    starterCode: 'def group_vessels(vessels):\n    pass\n\nprint(group_vessels([(\'Aurora\',\'North\'), (\'Mira\',\'South\'), (\'Sol\',\'North\')]))',
    tags: ['Dictionaries', 'Harbor Challenge'],
  },
  {
    id: 27,
    title: 'Decode the Shift Pattern',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Decode a lowercase message shifted forward by one alphabet character.',
    example: 'message = \'ibscps\'\nResult: \'harbor\'',
    expectedOutput: '\'harbor\'',
    starterCode: 'def decode_shift(message):\n    pass\n\nprint(decode_shift(\'ibscps\'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 28,
    title: 'Build a Safe Command Stack',
    difficulty: 'Medium',
    category: 'Stacks',
    description: 'Simulate push and pop commands using a last-in-first-out structure.',
    example: 'commands = [\'push A\',\'push B\',\'pop\']\nResult: [\'A\']',
    expectedOutput: '[\'A\']',
    starterCode: 'def command_stack(commands):\n    pass\n\nprint(command_stack([\'push A\',\'push B\',\'pop\']))',
    tags: ['Stacks', 'Harbor Challenge'],
  },
  {
    id: 29,
    title: 'Trace a Route Through the Grid',
    difficulty: 'Medium',
    category: 'Backtracking',
    description: 'Determine whether the bottom-right cell is reachable from the top-left through open cells.',
    example: 'grid = [[0,0,1],[1,0,0],[1,1,0]]\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def route_exists(grid):\n    pass\n\nprint(route_exists([[0,0,1],[1,0,0],[1,1,0]]))',
    tags: ['Backtracking', 'Harbor Challenge'],
  },
  {
    id: 30,
    title: 'Count Connected Dock Zones',
    difficulty: 'Medium',
    category: 'Graphs',
    description: 'Count separate connected groups in an undirected dock network.',
    example: 'zones = 5, links = [(0,1),(1,2),(3,4)]\nResult: 2',
    expectedOutput: '2',
    starterCode: 'def connected_zones(zones, links):\n    pass\n\nprint(connected_zones(5, [(0,1),(1,2),(3,4)]))',
    tags: ['Graphs', 'Harbor Challenge'],
  },
  {
    id: 31,
    title: 'Plan the Cheapest Supply Run',
    difficulty: 'Hard',
    category: 'Graphs',
    description: 'Find the minimum travel cost from one dock to every reachable dock.',
    example: 'roads = [(0,1,4),(0,2,1),(2,1,2)], start = 0\nResult: {0:0,1:3,2:1}',
    expectedOutput: '{0: 0, 1: 3, 2: 1}',
    starterCode: 'def cheapest_routes(roads, start):\n    pass\n\nprint(cheapest_routes([(0,1,4),(0,2,1),(2,1,2)], 0))',
    tags: ['Graphs', 'Harbor Challenge'],
  },
  {
    id: 32,
    title: 'Find the Longest Stable Sequence',
    difficulty: 'Hard',
    category: 'Dynamic Programming',
    description: 'Return the length of the longest strictly increasing subsequence.',
    example: 'readings = [10,4,6,7,2,9]\nResult: 4',
    expectedOutput: '4',
    starterCode: 'def longest_stable(readings):\n    pass\n\nprint(longest_stable([10,4,6,7,2,9]))',
    tags: ['Dynamic Programming', 'Harbor Challenge'],
  },
  {
    id: 33,
    title: 'Rebuild the Navigation Tree',
    difficulty: 'Hard',
    category: 'Trees',
    description: 'Reconstruct a binary search tree from preorder data and return its inorder traversal.',
    example: 'preorder = [8,3,1,6,10]\nResult: [1,3,6,8,10]',
    expectedOutput: '[1, 3, 6, 8, 10]',
    starterCode: 'def rebuild_tree(preorder):\n    pass\n\nprint(rebuild_tree([8,3,1,6,10]))',
    tags: ['Trees', 'Harbor Challenge'],
  },
  {
    id: 34,
    title: 'Search the Harbor Network',
    difficulty: 'Medium',
    category: 'Graphs',
    description: 'Return a breadth-first traversal order for an undirected dock network.',
    example: 'links = [(0,1),(0,2),(1,3),(2,4)], start = 0\nResult: [0,1,2,3,4]',
    expectedOutput: '[0, 1, 2, 3, 4]',
    starterCode: 'def search_network(links, start):\n    pass\n\nprint(search_network([(0,1),(0,2),(1,3),(2,4)], 0))',
    tags: ['Graphs', 'Harbor Challenge'],
  },
  {
    id: 35,
    title: 'Detect a Loop in the Route Map',
    difficulty: 'Medium',
    category: 'Linked Lists',
    description: 'Detect whether a linked route eventually points back to an earlier node.',
    example: 'route = 1 -> 2 -> 3 -> 2\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def has_route_loop(route):\n    pass',
    tags: ['Linked Lists', 'Harbor Challenge'],
  },
  {
    id: 36,
    title: 'Find the Shared Transfer Point',
    difficulty: 'Medium',
    category: 'Linked Lists',
    description: 'Return the value at the first node shared by two linked routes.',
    example: 'route_a = 4 -> 7 -> 9, route_b = 2 -> 9\nResult: 9',
    expectedOutput: '9',
    starterCode: 'def shared_transfer(route_a, route_b):\n    pass',
    tags: ['Linked Lists', 'Harbor Challenge'],
  },
  {
    id: 37,
    title: 'Order the Incoming Cargo',
    difficulty: 'Medium',
    category: 'Sorting',
    description: 'Sort cargo weights without using Python\'s built-in sorting.',
    example: 'weights = [7,2,9,1]\nResult: [1,2,7,9]',
    expectedOutput: '[1, 2, 7, 9]',
    starterCode: 'def order_cargo(weights):\n    pass\n\nprint(order_cargo([7,2,9,1]))',
    tags: ['Sorting', 'Harbor Challenge'],
  },
  {
    id: 38,
    title: 'Find the Kth Largest Reading',
    difficulty: 'Medium',
    category: 'Heaps',
    description: 'Return the kth largest value without sorting the entire collection.',
    example: 'readings = [9,1,7,3,8], k = 2\nResult: 8',
    expectedOutput: '8',
    starterCode: 'def kth_largest(readings, k):\n    pass\n\nprint(kth_largest([9,1,7,3,8], 2))',
    tags: ['Heaps', 'Harbor Challenge'],
  },
  {
    id: 39,
    title: 'Keep the Top Three Alerts',
    difficulty: 'Medium',
    category: 'Heaps',
    description: 'Keep only the three highest alert scores from a stream.',
    example: 'scores = [12,4,19,7,21,9]\nResult: [21,19,12]',
    expectedOutput: '[21, 19, 12]',
    starterCode: 'def top_three(scores):\n    pass\n\nprint(top_three([12,4,19,7,21,9]))',
    tags: ['Heaps', 'Harbor Challenge'],
  },
  {
    id: 40,
    title: 'Schedule Non-Overlapping Jobs',
    difficulty: 'Medium',
    category: 'Greedy',
    description: 'Choose the maximum number of jobs that do not overlap.',
    example: 'jobs = [(1,3),(2,4),(3,5),(5,7)]\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def schedule_jobs(jobs):\n    pass\n\nprint(schedule_jobs([(1,3),(2,4),(3,5),(5,7)]))',
    tags: ['Greedy', 'Harbor Challenge'],
  },
  {
    id: 41,
    title: 'Protect the Minimum Fuel Level',
    difficulty: 'Medium',
    category: 'Greedy',
    description: 'Find the minimum starting fuel so the vessel never drops below zero.',
    example: 'changes = [-3,2,-4,5]\nResult: 8',
    expectedOutput: '8',
    starterCode: 'def minimum_fuel(changes):\n    pass\n\nprint(minimum_fuel([-3,2,-4,5]))',
    tags: ['Greedy', 'Harbor Challenge'],
  },
  {
    id: 42,
    title: 'Build the Fastest Lookup Table',
    difficulty: 'Medium',
    category: 'Hash Maps',
    description: 'Build an ID-to-status lookup and answer one vessel query.',
    example: 'records = [(\'A7\',\'ready\'),(\'B2\',\'offline\')], query = \'B2\'\nResult: \'offline\'',
    expectedOutput: '\'offline\'',
    starterCode: 'def vessel_status(records, query):\n    pass\n\nprint(vessel_status([(\'A7\',\'ready\'),(\'B2\',\'offline\')], \'B2\'))',
    tags: ['Hash Maps', 'Harbor Challenge'],
  },
  {
    id: 43,
    title: 'Count Matching Pairs',
    difficulty: 'Easy',
    category: 'Hash Maps',
    description: 'Count how many complete pairs of identical badge IDs can be formed.',
    example: 'badges = [2,2,3,3,3,4]\nResult: 2',
    expectedOutput: '2',
    starterCode: 'def matching_pairs(badges):\n    pass\n\nprint(matching_pairs([2,2,3,3,3,4]))',
    tags: ['Hash Maps', 'Harbor Challenge'],
  },
  {
    id: 44,
    title: 'Validate a Harbor Record',
    difficulty: 'Easy',
    category: 'Conditionals',
    description: 'A record is valid only when its name is present, its status is allowed, and capacity is non-negative.',
    example: 'record = {\'name\':\'Aurora\',\'status\':\'ready\',\'capacity\':12}\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def validate_record(record):\n    pass\n\nprint(validate_record({\'name\':\'Aurora\',\'status\':\'ready\',\'capacity\':12}))',
    tags: ['Conditionals', 'Harbor Challenge'],
  },
  {
    id: 45,
    title: 'Parse a Sensor Report',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Parse semicolon-separated key=value sensor fields into a dictionary.',
    example: 'report = \'temp=31;mode=night\'\nResult: {\'temp\':\'31\',\'mode\':\'night\'}',
    expectedOutput: '{\'temp\':\'31\',\'mode\':\'night\'}',
    starterCode: 'def parse_report(report):\n    pass\n\nprint(parse_report(\'temp=31;mode=night\'))',
    tags: ['Strings', 'Harbor Challenge'],
  },
  {
    id: 46,
    title: 'Convert Coordinates Safely',
    difficulty: 'Easy',
    category: 'Functions',
    description: 'Convert \'x,y\' into an integer coordinate pair; invalid input returns None.',
    example: 'value = \'18,42\'\nResult: (18,42)',
    expectedOutput: '(18,42)',
    starterCode: 'def convert_coordinates(value):\n    pass\n\nprint(convert_coordinates(\'18,42\'))',
    tags: ['Functions', 'Harbor Challenge'],
  },
  {
    id: 47,
    title: 'Retry a Failed Dock Check',
    difficulty: 'Medium',
    category: 'Exception Handling',
    description: 'Retry a temporary dock check up to three times and return the first success.',
    example: 'attempts = [\'error\',\'error\',\'ok\']\nResult: \'ok\'',
    expectedOutput: '\'ok\'',
    starterCode: 'def retry_check(attempts):\n    pass\n\nprint(retry_check([\'error\',\'error\',\'ok\']))',
    tags: ['Exception Handling', 'Harbor Challenge'],
  },
  {
    id: 48,
    title: 'Read a Manifest File',
    difficulty: 'Easy',
    category: 'File Handling',
    description: 'Count non-empty lines in a text manifest.',
    example: 'text = \'rope\\n\\nlamp\\ncrate\\n\'\nResult: 3',
    expectedOutput: '3',
    starterCode: 'def manifest_lines(text):\n    pass\n\nprint(manifest_lines(\'rope\\n\\nlamp\\ncrate\\n\'))',
    tags: ['File Handling', 'Harbor Challenge'],
  },
  {
    id: 49,
    title: 'Summarize Daily Readings',
    difficulty: 'Medium',
    category: 'Statistics',
    description: 'Return minimum, maximum, and two-decimal average for daily readings.',
    example: 'readings = [10,12,8,10]\nResult: {\'min\':8,\'max\':12,\'average\':10.0}',
    expectedOutput: '{\'min\': 8, \'max\': 12, \'average\': 10.0}',
    starterCode: 'def summarize_readings(readings):\n    pass\n\nprint(summarize_readings([10,12,8,10]))',
    tags: ['Statistics', 'Harbor Challenge'],
  },
  {
    id: 50,
    title: 'Clean a Cargo Table',
    difficulty: 'Medium',
    category: 'Pandas',
    description: 'Filter a table so only rows with positive cargo weight remain.',
    example: 'weights = [10,-2,7]\nResult: rows A and C remain',
    expectedOutput: 'rows A and C',
    starterCode: 'def clean_cargo_table(df):\n    pass',
    tags: ['Pandas', 'Harbor Challenge'],
  },
  {
    id: 51,
    title: 'Filter the Harbor Dataset',
    difficulty: 'Medium',
    category: 'Pandas',
    description: 'Return vessel names whose load exceeds a supplied limit.',
    example: 'loads = A:8, B:17, C:12; limit = 10\nResult: [\'B\',\'C\']',
    expectedOutput: '[\'B\', \'C\']',
    starterCode: 'def filter_harbor_data(df, limit):\n    pass',
    tags: ['Pandas', 'Harbor Challenge'],
  },
  {
    id: 52,
    title: 'Expose a Vessel Status API',
    difficulty: 'Medium',
    category: 'APIs',
    description: 'Return an API-style not-found response when a vessel ID is unknown.',
    example: 'vessels = {\'A7\':\'ready\'}, requested = \'X9\'\nResult: {\'status\':404}',
    expectedOutput: '{\'status\': 404}',
    starterCode: 'def vessel_api(vessels, vessel_id):\n    pass',
    tags: ['APIs', 'Harbor Challenge'],
  },
  {
    id: 53,
    title: 'Validate an Incoming Request',
    difficulty: 'Medium',
    category: 'APIs',
    description: 'Validate that a request has a non-empty vessel ID and priority from 1 through 5.',
    example: 'request = {\'vessel_id\':\'A7\',\'priority\':4}\nResult: True',
    expectedOutput: 'True',
    starterCode: 'def validate_request(request):\n    pass\n\nprint(validate_request({\'vessel_id\':\'A7\',\'priority\':4}))',
    tags: ['APIs', 'Harbor Challenge'],
  },
  {
    id: 54,
    title: 'Store a Harbor Record',
    difficulty: 'Medium',
    category: 'Databases',
    description: 'Insert a record only when its ID does not already exist.',
    example: 'stored = [{\'id\':1}], new = {\'id\':2}\nResult: two stored records',
    expectedOutput: '[{\'id\': 1}, {\'id\': 2}]',
    starterCode: 'def store_record(stored, new_record):\n    pass',
    tags: ['Databases', 'Harbor Challenge'],
  },
  {
    id: 55,
    title: 'Query the Latest Inspection',
    difficulty: 'Medium',
    category: 'SQL',
    description: 'Write a SQL query that returns the newest inspection timestamp for each vessel.',
    example: 'Table: inspections(vessel_id, inspected_at)\nResult: one latest timestamp per vessel',
    expectedOutput: 'SQL query',
    starterCode: 'SELECT vessel_id, MAX(inspected_at) AS latest_inspection\nFROM inspections\nGROUP BY vessel_id;',
    tags: ['SQL', 'Harbor Challenge'],
  },
  {
    id: 56,
    title: 'Process Jobs Without Blocking',
    difficulty: 'Hard',
    category: 'Async Python',
    description: 'Run independent remote checks concurrently with asyncio and return their results.',
    example: 'checks = [\'weather\',\'inventory\',\'crew\']\nResult: each check completes without blocking the others',
    expectedOutput: '[\'weather ok\', \'inventory ok\', \'crew ok\']',
    starterCode: 'import asyncio\n\nasync def solution(names):\n    # Run independent checks concurrently.\n    pass',
    tags: ['Async Python', 'Harbor Challenge'],
  },
  {
    id: 57,
    title: 'Measure the Slowest Operation',
    difficulty: 'Medium',
    category: 'Performance',
    description: 'Return the slowest operation name and duration.',
    example: 'operations = [(\'scan\',12),(\'load\',31),(\'seal\',18)]\nResult: (\'load\',31)',
    expectedOutput: '(\'load\', 31)',
    starterCode: 'def slowest_operation(operations):\n    pass\n\nprint(slowest_operation([(\'scan\',12),(\'load\',31),(\'seal\',18)]))',
    tags: ['Performance', 'Harbor Challenge'],
  },
  {
    id: 58,
    title: 'Build the Harbor Dashboard Feed',
    difficulty: 'Hard',
    category: 'Web',
    description: 'Transform a raw vessel record into the compact object needed by a dashboard.',
    example: 'record = {\'id\':7,\'name\':\'Aurora\',\'status\':\'ready\'}\nResult: add label \'Aurora — READY\'',
    expectedOutput: '{\'id\': 7, \'name\': \'Aurora\', \'status\': \'ready\', \'label\': \'Aurora — READY\'}',
    starterCode: 'def dashboard_record(record):\n    pass',
    tags: ['Web', 'Harbor Challenge'],
  },
  {
    id: 59,
    title: 'Design the Harbor Master System',
    difficulty: 'Hard',
    category: 'Capstone',
    description: 'Combine vessel, task, and capacity information into one Harbor Master summary.',
    example: 'active=2, tasks=5, completed=2, capacity=10, occupied=7\nResult: active=2, pending=3, remaining=3',
    expectedOutput: '{\'active_vessels\':2,\'pending_tasks\':3,\'remaining_capacity\':3}',
    starterCode: 'def harbor_master_summary(active, tasks, completed, capacity, occupied):\n    pass',
    tags: ['Capstone', 'Harbor Challenge'],
  },
  {
    id: 60,
    title: 'Harbor Queue Priority',
    difficulty: 'Medium',
    category: 'Queues',
    description: 'Process urgent jobs before normal jobs while preserving arrival order within each priority.',
    example: 'jobs = [(\'A\',\'normal\'),(\'B\',\'urgent\'),(\'C\',\'normal\'),(\'D\',\'urgent\')]\nResult: [\'B\',\'D\',\'A\',\'C\']',
    expectedOutput: '[\'B\', \'D\', \'A\', \'C\']',
    starterCode: 'def prioritize_queue(jobs):\n    pass\n\nprint(prioritize_queue([(\'A\',\'normal\'),(\'B\',\'urgent\'),(\'C\',\'normal\'),(\'D\',\'urgent\')]))',
    tags: ['Queues', 'Harbor Challenge'],
  },
]

const difficultyColor: Record<Difficulty, string> = {
  Easy: '#16A34A',
  Medium: '#B7791F',
  Hard: '#DC2626',
}

const difficultyBgLight: Record<Difficulty, string> = {
  Easy: '#ECFDF3',
  Medium: '#FFF8E7',
  Hard: '#FFF1F2',
}

const difficultyBgDark: Record<Difficulty, string> = {
  Easy: '#0B2115',
  Medium: '#241A08',
  Hard: '#250D10',
}


type CurriculumLesson = {
  number: number
  title: string
  focus: string
  level: 'BEGINNER' | 'INTERMEDIATE' | 'HARD'
  problemId?: number
}

const getLessonTrack = (number: number) => {
  if (number <= 11) return 'FOUNDATIONS'
  if (number <= 20) return 'CORE PYTHON'
  if (number <= 30) return 'PYTHON ENGINEERING'
  if (number <= 37) return 'DATA & DATABASES'
  if (number <= 42) return 'DATA SCIENCE'
  if (number <= 46) return 'DSA & ALGORITHMS'
  if (number <= 53) return 'SYSTEMS & WEB'
  return 'AI & PRODUCTION'
}

const curriculumLessons: CurriculumLesson[] = [
  { number: 1, title: "First Contact", focus: "Discover how Python turns an idea into a precise instruction, and how syntax, values, and execution fit together.", level: "BEGINNER", problemId: undefined },
  { number: 2, title: "Giving Data a Shape", focus: "Name values, understand objects and types, and learn how Python stores and retrieves information.", level: "BEGINNER", problemId: undefined },
  { number: 3, title: "Speaking Python Clearly", focus: "Comments, indentation, keywords, identifiers, input, output, None, and the rules that make code readable.", level: "BEGINNER", problemId: undefined },
  { number: 4, title: "Making Expressions Work", focus: "Numbers, booleans, arithmetic, comparisons, assignment, logic, and evaluation order.", level: "BEGINNER", problemId: undefined },
  { number: 5, title: "Working with Text", focus: "Strings, indexing, slicing, methods, escaping, formatting, and the difference between text and data.", level: "BEGINNER", problemId: undefined },
  { number: 6, title: "Building Ordered Data", focus: "Lists, indexing, mutation, iteration, copying, nesting, and choosing the right collection.", level: "BEGINNER", problemId: undefined },
  { number: 7, title: "Fixed Collections", focus: "Tuples, unpacking, immutability, and when a fixed structure communicates intent.", level: "BEGINNER", problemId: undefined },
  { number: 8, title: "Working with Uniqueness", focus: "Sets, membership, set operations, and using uniqueness to simplify real problems.", level: "BEGINNER", problemId: undefined },
  { number: 9, title: "Connecting Keys to Values", focus: "Dictionaries, lookup, mutation, nesting, iteration, and modelling structured information.", level: "BEGINNER", problemId: undefined },
  { number: 10, title: "Teaching Code to Decide", focus: "if, elif, else, truthiness, comparisons, match, and how programs choose a path.", level: "BEGINNER", problemId: undefined },
  { number: 11, title: "Controlling Repetition", focus: "while, for, range, iteration, loop control, and reasoning about repeated execution.", level: "BEGINNER", problemId: undefined },
  { number: 12, title: "Turning Ideas into Functions", focus: "Functions, parameters, arguments, return values, defaults, scope, and reusable behaviour.", level: "INTERMEDIATE", problemId: undefined },
  { number: 13, title: "Functions with More Power", focus: "*args, **kwargs, unpacking, recursion, closures, and local versus global state.", level: "INTERMEDIATE", problemId: undefined },
  { number: 14, title: "Functions That Handle Functions", focus: "First-class functions, lambda, map, filter, reduce, callbacks, and choosing clarity over cleverness.", level: "INTERMEDIATE", problemId: undefined },
  { number: 15, title: "Growing Beyond One File", focus: "Modules, imports, packages, namespaces, and how Python finds reusable code.", level: "INTERMEDIATE", problemId: undefined },
  { number: 16, title: "Managing the Python Environment", focus: "pip, virtual environments, dependencies, requirements, package metadata, and reproducible projects.", level: "INTERMEDIATE", problemId: undefined },
  { number: 17, title: "Reading Python's Complaints", focus: "Syntax errors, NameError, TypeError, ValueError, tracebacks, and debugging from evidence.", level: "INTERMEDIATE", problemId: undefined },
  { number: 18, title: "Designing for Failure", focus: "try, except, else, finally, raising exceptions, custom exceptions, and safe recovery.", level: "INTERMEDIATE", problemId: undefined },
  { number: 19, title: "Crossing the File Boundary", focus: "Reading, writing, paths, directories, pathlib, os, encodings, and safe file workflows.", level: "INTERMEDIATE", problemId: undefined },
  { number: 20, title: "Working with Structured Data", focus: "JSON, serialization, parsing, dates, times, and moving structured information between systems.", level: "INTERMEDIATE", problemId: undefined },
  { number: 21, title: "Thinking in Objects", focus: "Classes, objects, attributes, methods, self, constructors, and the problem object design solves.", level: "HARD", problemId: undefined },
  { number: 22, title: "Building Better Objects", focus: "Properties, encapsulation, class methods, static methods, composition, and responsible object design.", level: "HARD", problemId: undefined },
  { number: 23, title: "Relationships Between Objects", focus: "Inheritance, polymorphism, abstract interfaces, overriding, and when composition is better.", level: "HARD", problemId: undefined },
  { number: 24, title: "Python's Hidden Machinery", focus: "Dunder methods, protocols, iterators, iterable objects, and how Python makes objects cooperate with syntax.", level: "HARD", problemId: undefined },
  { number: 25, title: "Generators and Lazy Work", focus: "yield, generator expressions, lazy evaluation, pipelines, and efficient streaming.", level: "HARD", problemId: undefined },
  { number: 26, title: "Context and Resource Safety", focus: "with, context managers, cleanup guarantees, custom context managers, and safe resource ownership.", level: "HARD", problemId: undefined },
  { number: 27, title: "Pattern Hunting in Text", focus: "Regular expressions, groups, matching, substitution, validation, and knowing when regex is the wrong tool.", level: "HARD", problemId: undefined },
  { number: 28, title: "Talking to Other Systems", focus: "HTTP, requests, clients, status codes, headers, payloads, retries, timeouts, and API thinking.", level: "HARD", problemId: undefined },
  { number: 29, title: "Building the Doorway", focus: "REST APIs, routes, schemas, validation, errors, authentication concepts, and clear contracts.", level: "HARD", problemId: undefined },
  { number: 30, title: "Testing What You Build", focus: "Assertions, unit tests, fixtures, edge cases, mocking concepts, test organisation, and confidence through evidence.", level: "HARD", problemId: undefined },
  { number: 31, title: "Debugging Like an Engineer", focus: "Breakpoints, tracing state, reproducing bugs, isolating causes, logging, and turning failures into information.", level: "HARD", problemId: undefined },
  { number: 32, title: "Typing the Shape of Intent", focus: "Type hints, annotations, generics, protocols, optional values, and communicating contracts.", level: "HARD", problemId: undefined },
  { number: 33, title: "Working with Databases", focus: "SQL fundamentals, tables, keys, CRUD, joins, transactions, and safe parameterised access.", level: "HARD", problemId: undefined },
  { number: 34, title: "Building with SQLite", focus: "Local relational storage, schemas, persistence, queries, and database-backed programs.", level: "HARD", problemId: undefined },
  { number: 35, title: "Working with MySQL", focus: "Server databases, relationships, queries, updates, transactions, and production-style storage.", level: "HARD", problemId: undefined },
  { number: 36, title: "Working with MongoDB", focus: "Documents, collections, queries, updates, indexes, and when document storage fits.", level: "HARD", problemId: undefined },
  { number: 37, title: "Data Access Without Chaos", focus: "SQLAlchemy concepts, connection lifecycles, transactions, and separating data access from business logic.", level: "HARD", problemId: undefined },
  { number: 38, title: "Numbers That Tell a Story", focus: "Statistics, mean, median, spread, percentiles, distributions, and evidence-based reasoning.", level: "HARD", problemId: undefined },
  { number: 39, title: "NumPy: Thinking in Arrays", focus: "Array shape, dtype, vectorised operations, indexing, broadcasting, and numerical Python's mental model.", level: "HARD", problemId: undefined },
  { number: 40, title: "Pandas: Working with Tables", focus: "Series, DataFrames, filtering, missing data, grouping, joining, reshaping, and real dataset analysis.", level: "HARD", problemId: undefined },
  { number: 41, title: "Seeing the Data", focus: "Matplotlib, axes, labels, grids, lines, bars, scatter plots, histograms, and clear visual communication.", level: "HARD", problemId: undefined },
  { number: 42, title: "From Data to Insight", focus: "Acquire, clean, transform, inspect, visualise, explain, and reproduce an analysis.", level: "HARD", problemId: undefined },
  { number: 43, title: "Algorithms and Complexity", focus: "Time and space complexity, searching, sorting, trade-offs, and predicting how solutions scale.", level: "HARD", problemId: undefined },
  { number: 44, title: "Core Data Structures", focus: "Stacks, queues, linked lists, hash tables, heaps, and the ideas behind common structures.", level: "HARD", problemId: undefined },
  { number: 45, title: "Trees and Graphs", focus: "Trees, binary trees, binary search trees, graphs, traversal, relationships, and connected information.", level: "HARD", problemId: undefined },
  { number: 46, title: "Solving Problems Systematically", focus: "Problem decomposition, invariants, recursion, backtracking, dynamic programming, and deliberate strategy.", level: "HARD", problemId: undefined },
  { number: 47, title: "Python Concurrency", focus: "Threads, processes, queues, shared work, race conditions, and choosing concurrency appropriately.", level: "HARD", problemId: undefined },
  { number: 48, title: "Async Python", focus: "async, await, asyncio, coroutines, tasks, I/O concurrency, and cancellation.", level: "HARD", problemId: undefined },
  { number: 49, title: "Performance and Memory", focus: "Profiling, bottlenecks, memory behaviour, generators, caching, and measuring before optimising.", level: "HARD", problemId: undefined },
  { number: 50, title: "Building Reliable Applications", focus: "Configuration, environment variables, logging, validation, error boundaries, security basics, and maintainable architecture.", level: "HARD", problemId: undefined },
  { number: 51, title: "Python Web Applications", focus: "Flask and Django concepts, routing, templates, forms, sessions, databases, and request-response flow.", level: "HARD", problemId: undefined },
  { number: 52, title: "Modern API Applications", focus: "FastAPI-style architecture, typed schemas, dependency patterns, authentication, and service boundaries.", level: "HARD", problemId: undefined },
  { number: 53, title: "Automation and Integration", focus: "CLI tools, scheduled work, HTTP integrations, file automation, JSON pipelines, and useful automation.", level: "HARD", problemId: undefined },
  { number: 54, title: "Machine Learning Foundations", focus: "Features, targets, train/test thinking, preprocessing, regression, classification, and meaningful metrics.", level: "HARD", problemId: undefined },
  { number: 55, title: "Choosing and Evaluating Models", focus: "Decision trees, nearest neighbours, clustering, cross-validation, confusion matrices, ROC/AUC, and model selection.", level: "HARD", problemId: undefined },
  { number: 56, title: "Packaging and Shipping", focus: "pyproject.toml, entry points, dependency boundaries, builds, releases, and reproducible delivery.", level: "HARD", problemId: undefined },
  { number: 57, title: "Security and Production Thinking", focus: "Secrets, input validation, least privilege, dependency risk, secure defaults, observability, and responsible deployment.", level: "HARD", problemId: undefined },
  { number: 58, title: "Architecture and Capstone Planning", focus: "Turn a real requirement into modules, data flow, interfaces, tests, milestones, and maintainable system design.", level: "HARD", problemId: undefined },
  { number: 59, title: "Deployment and Operations", focus: "Environment configuration, deployment strategy, health checks, monitoring, failure recovery, and operating a live Python service.", level: "HARD", problemId: undefined },
  { number: 60, title: "The Harbor Master Capstone", focus: "Design, build, test, document, deploy, and explain a complete Python system that brings the entire journey together.", level: "HARD", problemId: undefined }
]

const makeLessonProblem = (lesson: CurriculumLesson): Problem => {
  const starterByLesson: Record<number, string> = {
    13: 'values = [1, 2, 3, 4, 5]\nresult = [x * x for x in values]\nprint(result)',
    14: 'def apply(fn, value):\n    return fn(value)\n\nprint(apply(lambda x: x * 2, 8))',
    15: 'user = {"profile": {"city": "Chennai"}}\nprint(user["profile"]["city"])',
    16: 'try:\n    print(10 / 0)\nexcept ZeroDivisionError:\n    print("Cannot divide by zero")',
    17: 'value = 42\nprint(type(value).__name__)',
    18: 'with open("harbor.txt", "w") as file:\n    file.write("Harbor ready")\nprint("Harbor ready")',
    19: 'from datetime import date\nstart = date(2026, 8, 1)\nend = date(2026, 8, 6)\nprint((end - start).days)',
    20: 'import re\nprint(bool(re.search(r"\\d{3}", "Dock 123")))',
  }
  const starter = starterByLesson[lesson.number] ??
    `# ${lesson.title}\n# ${lesson.focus}\n\nprint("Explore ${lesson.title}")`
  return {
    id: 1000 + lesson.number,
    title: lesson.title,
    difficulty: lesson.level === 'BEGINNER' ? 'Easy' : lesson.level === 'INTERMEDIATE' ? 'Medium' : 'Hard',
    category: lesson.focus,
    description: `Practice ${lesson.focus.toLowerCase()} in a small Harbor Console experiment.`,
    example: `Lesson ${String(lesson.number).padStart(2, '0')}\n${lesson.focus}`,
    expectedOutput: 'Your code runs successfully.',
    starterCode: starter,
    tags: [lesson.level, lesson.focus],
  }
}

const teachingGuide: Record<number, {
  question: string
  why: string
  steps: string[]
  code: string
  whatPythonDoes: string
  exercise: string
  answer: string
  explanation: string
  prediction: { question: string; options: string[]; correct: number; explanation: string }
  quiz: { question: string; options: string[]; correct: number; explanation: string }
  playgrounds?: { title: string; goal: string; code: string; predict: string; change: string; notice: string }[]
  exercises?: {
    title: string
    prompt: string
    hint: string
    expected: string
    starterCode: string
    points: number
    correctExplanation: string
    incorrectExplanation: string
  }[]
  quizzes?: { question: string; options: string[]; correct: number; explanation: string }[]
  examples?: {
    title: string
    code: string
    explanation: string
    whatPythonDoes?: string
    tryIt?: string
  }[]
  opening?: string
  deepDive?: {
    title: string
    body: string
    code?: string
    breakdown?: { part: string; meaning: string }[]
    whatPythonDoes?: string
    tryIt?: string
  }[]
}> = {
  1: {
    exercises: [
      { title: `01 · Send a Harbor status message`, prompt: `Write Python that prints exactly: Harbor online`, hint: `Use print() with a string.`, expected: `Harbor online`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Your program is correct because print() displays the string value exactly as requested.', incorrectExplanation: 'The output did not match the target. Check that you used print() and that the text, spelling, capitalization, and spaces are exactly `Harbor online`.' },
      { title: `02 · Print your first number`, prompt: `Print the number 42. Do not put quotation marks around it.`, hint: `A number and a string containing a number are different values.`, expected: `42`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. 42 is an integer value, so Python prints the numeric value without quotation marks.', incorrectExplanation: 'The expected output is 42. Make sure you are printing the integer 42 rather than a different number or the text `42` with extra characters.' },
      { title: `03 · Calculate before printing`, prompt: `Print the result of 7 + 8.`, hint: `Let Python perform the addition instead of typing the result directly.`, expected: `15`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. Python evaluates 7 + 8 first, producing 15, and print() displays that result.', incorrectExplanation: 'Python should calculate 7 + 8 and produce 15. Check the arithmetic expression and make sure you are printing its result rather than a different value.' },
      { title: `04 · Join two strings`, prompt: `Use + to join the strings "Harbor" and "Ready" with no space between them.`, hint: `String + string creates one longer string.`, expected: `HarborReady`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. When both operands are strings, + concatenates them, producing `HarborReady`.', incorrectExplanation: 'The target is `HarborReady`. Make sure both pieces are strings and that you use + without adding an unwanted space.' },
      { title: `05 · Create a two-line announcement`, prompt: `Print Harbor on the first line and Console on the second line.`, hint: `Use two print statements, or use a newline escape sequence.`, expected: `Harbor\nConsole`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. The two output lines appear in the required order: Harbor first, then Console.', incorrectExplanation: 'The required output has exactly two lines. Check the order and make sure Harbor and Console are separated by a newline.' },
      { title: `06 · Report a Boolean`, prompt: `Print the Boolean value True.`, hint: `True is a Python value, not the string "True".`, expected: `True`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: "Correct. True is Python's Boolean value, not a quoted string.", incorrectExplanation: 'The expected output is the Boolean value True. Check capitalization and make sure you did not turn it into a different value.' },
      { title: `07 · Report a false state`, prompt: `Print the Boolean value False.`, hint: `Boolean literals are written True and False with capital first letters.`, expected: `False`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: "Correct. False is Python's Boolean value for a false state.", incorrectExplanation: 'The expected output is False. Python Boolean literals use a capital first letter: `False`.' },
      { title: `08 · Print a sentence`, prompt: `Print exactly: The Harbor is ready`, hint: `The spaces inside the quotation marks are part of the string.`, expected: `The Harbor is ready`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. print() displays the complete string, including the spaces inside it.', incorrectExplanation: 'The target sentence is exactly `The Harbor is ready`. Check every word, capitalization, and space.' },
      { title: `09 · Use multiple print values`, prompt: `Use one print() call to display Dock Open with one space between the words.`, hint: `print() can receive more than one value and separates them with spaces by default.`, expected: `Dock Open`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. print() separates multiple arguments with a space by default, giving `Dock Open`.', incorrectExplanation: 'The target is `Dock Open` with one space. Check that you supplied the two values to print() in the correct order.' },
      { title: `10 · Divide two numbers`, prompt: `Print the result of 20 / 5.`, hint: `Ask Python to perform the division.`, expected: `4.0`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: "Correct. Python's / operator performs true division, so 20 / 5 evaluates to 4.0.", incorrectExplanation: 'The expected result is 4.0. Check that you used / for division and that both numbers are 20 and 5.' },
      { title: `11 · Use parentheses to control order`, prompt: `Print the result of (2 + 3) * 4.`, hint: `The parentheses make 2 + 3 happen before the multiplication.`, expected: `20`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. Parentheses force 2 + 3 to happen first, giving 5, and then 5 * 4 gives 20.', incorrectExplanation: 'The target is 20. Parentheses must make 2 + 3 happen before the multiplication.' },
      { title: `12 · Observe operator precedence`, prompt: `Print the result of 2 + 3 * 4 without changing the expression.`, hint: `Multiplication is evaluated before addition here.`, expected: `14`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. Python evaluates 3 * 4 before adding 2, so the expression produces 14.', incorrectExplanation: 'The target is 14. Do not change the expression: multiplication has higher precedence than addition here.' },
      { title: `13 · Make a comment, then execute`, prompt: `Add a comment explaining the program, then print exactly: READY`, hint: `Start a comment with #. The comment itself should not appear in output.`, expected: `READY`, starterCode: `# Explain what your program does here\n`, points: 5, correctExplanation: 'Correct. Python ignores the comment during execution and prints READY.', incorrectExplanation: 'The comment should not create output. Make sure your executable code prints exactly `READY` and your comment begins with #.' },
      { title: `14 · Print three values in order`, prompt: `Print Harbor, Python, Online as three separate lines.`, hint: `Three print() calls make the order obvious.`, expected: `Harbor\nPython\nOnline`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. The three print() calls create three lines in the required order.', incorrectExplanation: 'The expected output has Harbor, Python, and Online on separate lines and in that order. Check each print() call.' },
      { title: `15 · Multiply a value`, prompt: `Print the result of 6 * 7.`, hint: `Use the multiplication operator * inside print().`, expected: `42`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. 6 * 7 evaluates to 42, which print() displays.', incorrectExplanation: 'The expected result is 42. Check that you used multiplication and the values 6 and 7.' },
      { title: `16 · Subtract a value`, prompt: `Print the result of 30 - 12.`, hint: `Use the subtraction operator - inside the expression.`, expected: `18`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. 30 - 12 evaluates to 18.', incorrectExplanation: 'The target is 18. Check the subtraction operator and make sure the expression is 30 - 12.' },
      { title: `17 · Build one message from three strings`, prompt: `Use string concatenation to print exactly: HarborConsole.`, hint: `Join "Harbor" and "Console" with +.`, expected: `HarborConsole`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. String concatenation joins the text into the single value `HarborConsole`.', incorrectExplanation: 'The output must be exactly `HarborConsole`. Check the spelling and make sure no extra spaces are introduced.' },
      { title: `18 · Put a newline inside one string`, prompt: `Use one print() call to display Online on the first line and Again on the second.`, hint: `The escape sequence \\n represents a newline inside a string.`, expected: `Online\nAgain`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. The newline escape sequence separates Online and Again into two output lines.', incorrectExplanation: 'The required output has Online and Again on separate lines. Check that the string contains the newline escape sequence `\\n`.' },
      { title: `19 · Compare text and numbers`, prompt: `Print 34 on the first line by joining "3" and "4", then print 7 on the second line by adding 3 + 4.`, hint: `The first expression uses strings; the second uses integers.`, expected: `34\n7`, starterCode: `# Write your solution below\n`, points: 5, correctExplanation: 'Correct. Joining the strings `3` and `4` produces 34, while adding the integers 3 and 4 produces 7.', incorrectExplanation: 'This exercise deliberately contrasts strings and integers. The first line must be 34 and the second must be 7; check which values are quoted.' },
      { title: `20 · Final First Contact challenge`, prompt: `Write a four-line status report: HARBOR, ONLINE, PYTHON, READY — one word per line.`, hint: `Use four print statements or one string containing three newline escapes.`, expected: `HARBOR\nONLINE\nPYTHON\nREADY`, starterCode: `# First Contact challenge\n# Write your solution below\n`, points: 5, correctExplanation: 'Correct. Your four-line status report matches the requested order and demonstrates precise control over output.', incorrectExplanation: 'The required four lines are HARBOR, ONLINE, PYTHON, READY. Check the order, spelling, capitalization, and line breaks.' }
    ],
    examples: [
      { title: `Hello, Harbor`, code: `print("Hello, Harbor")`, explanation: `print() displays the text value you give it. This is one of the smallest complete Python programs.`, whatPythonDoes: `Python recognizes print as a function call, evaluates the string, and sends the characters to the console.`, tryIt: `Change the message to your own greeting.` },
      { title: `A number is a value too`, code: `print(42)`, explanation: `42 is an integer value. Because it is not inside quotation marks, Python treats it as a number rather than text.`, whatPythonDoes: `Python evaluates the integer 42 and gives that value to print().`, tryIt: `Replace 42 with another whole number and predict the output.` },
      { title: `Text and numbers are different`, code: `print("42")`, explanation: `"42" looks like a number to us, but the quotation marks make it a string containing two characters.`, whatPythonDoes: `Python creates a string value containing the characters 4 and 2, then print() displays it.`, tryIt: `Compare this with print(42).` },
      { title: `Python can calculate`, code: `print(10 + 5)`, explanation: `An expression can be evaluated before its result is displayed. Here Python performs numeric addition.`, whatPythonDoes: `Python evaluates 10 + 5 to 15, then passes 15 to print().`, tryIt: `Change one number and predict the new result.` },
      { title: `The same + can join text`, code: `print("10" + "5")`, explanation: `With strings, + means concatenation: joining one piece of text to another.`, whatPythonDoes: `Python combines the two strings into the new string "105".`, tryIt: `Try joining two words instead.` },
      { title: `One instruction after another`, code: `print("A")\nprint("B")\nprint("C")`, explanation: `Simple Python programs normally execute statements in source order from top to bottom.`, whatPythonDoes: `Python executes the first print, then the second, then the third.`, tryIt: `Move C to the first line and predict the output.` },
      { title: `Change only the value`, code: `print("Harbor online")`, explanation: `The instruction stays the same while the value can change. This is a useful way to experiment without changing several things at once.`, whatPythonDoes: `Python calls print() with the new string value.`, tryIt: `Change only the message.` },
      { title: `Parentheses have a job`, code: `print("Ready")`, explanation: `The parentheses show that print is being called and contain the value being passed to it.`, whatPythonDoes: `Python parses print("Ready") as a function call with one argument.`, tryIt: `Remove the closing parenthesis and read the resulting error.` },
      { title: `Quotation marks define text`, code: `print("Dock open")`, explanation: `Quotation marks tell Python where a string literal begins and ends.`, whatPythonDoes: `Python reads everything between the matching quotation marks as one string value.`, tryIt: `Change the text while keeping both quotation marks.` },
      { title: `A boolean is a value`, code: `print(True)`, explanation: `True is a Boolean value representing a truth state. It is not the same thing as the string "True".`, whatPythonDoes: `Python evaluates the Boolean object True and print() displays its representation.`, tryIt: `Try print(False).` },
      { title: `True versus "True"`, code: `print(True)\nprint("True")`, explanation: `The first line uses a Boolean value; the second uses text. They look similar when displayed but have different meanings to Python.`, whatPythonDoes: `Python creates two different kinds of values and prints each one.`, tryIt: `Change the text but leave the Boolean unchanged.` },
      { title: `Division produces a value`, code: `print(20 / 4)`, explanation: `The expression is evaluated before print() receives its result.`, whatPythonDoes: `Python divides 20 by 4 and produces the numeric result 5.0.`, tryIt: `Try a division that does not divide evenly and predict the result.` },
      { title: `Expressions can be combined`, code: `print(2 + 3 * 4)`, explanation: `Python evaluates the expression according to its operator rules before displaying the result.`, whatPythonDoes: `Multiplication is evaluated before addition, so the expression becomes 2 + 12 and then 14.`, tryIt: `Add parentheses and predict how the result changes.` },
      { title: `Parentheses can change meaning`, code: `print((2 + 3) * 4)`, explanation: `Parentheses can explicitly control the order in which parts of an expression are evaluated.`, whatPythonDoes: `Python evaluates 2 + 3 first, producing 5, then multiplies by 4 to produce 20.`, tryIt: `Compare this with print(2 + 3 * 4).` },
      { title: `A comment is not an instruction`, code: `# Harbor check\nprint("READY")`, explanation: `A comment is written for humans and is ignored by Python during normal execution.`, whatPythonDoes: `Python skips the comment and executes the print statement.`, tryIt: `Write your own comment above the print call.` },
      { title: `Whitespace can improve reading`, code: `print("Harbor")\n\nprint("Online")`, explanation: `Blank lines can make related instructions easier for humans to read without changing these two statements' meaning.`, whatPythonDoes: `Python executes the two print calls in order; the blank line does not become output.`, tryIt: `Add another blank line and predict whether the output changes.` },
      { title: `Strings can contain spaces`, code: `print("Harbor Console online")`, explanation: `Spaces inside quotation marks are part of the string value.`, whatPythonDoes: `Python keeps the characters, including the spaces, inside the string and print() displays them.`, tryIt: `Change the spacing inside the message.` },
      { title: `Escape a special character`, code: `print("Harbor\\nOnline")`, explanation: `The escape sequence \\n represents a newline inside a string, so one string can produce output across multiple lines.`, whatPythonDoes: `Python interprets \\n as a newline character when the string is processed for output.`, tryIt: `Add another \\n and predict the three output lines.` },
      { title: `Combine values before printing`, code: `print("Dock", "Open")`, explanation: `print() can receive multiple values. By default it separates them with a space.`, whatPythonDoes: `Python evaluates both strings and print() writes them with a separator between them.`, tryIt: `Add a third value.` },
      { title: `Predict before you run`, code: `print("3" + "4")\nprint(3 + 4)`, explanation: `This example deliberately places two similar-looking expressions side by side so you can predict how their different value types affect the result.`, whatPythonDoes: `The first expression concatenates strings and produces "34"; the second performs numeric addition and produces 7.`, tryIt: `Write down both outputs before pressing Run.` }
    ],
    opening: `Every Python program begins with a surprisingly simple act: you have an idea in your head, and you need to turn that idea into instructions a computer can follow without guessing. Python is the bridge between those two worlds. In this first contact, you are not learning a bag of commands. You are learning how to read code as a sequence of precise instructions, how Python recognises the structure of those instructions, how values move through them, and how an instruction becomes an observable result. Once this mental model is clear, variables, conditions, loops, functions, and data structures stop feeling like unrelated features. They become different ways of describing what a program should do.`,
    deepDive: [
      { title: `1 · From an idea to an instruction`, body: `Imagine saying, “Tell the Harbor that the system is ready.” A person can infer what you mean. A computer cannot. It needs a form that is precise enough to execute. Python lets you express the idea as an instruction such as print("HARBOR READY"). Programming is not primarily about memorising words; it is about translating an intention into exact instructions.`, code: `print("HARBOR READY")`, breakdown: [{ part: `print`, meaning: `The function being asked to display a value.` }, { part: `( )`, meaning: `The parentheses mark the function call and contain the argument.` }, { part: `"HARBOR READY"`, meaning: `A string value representing text.` }], whatPythonDoes: `Python recognises a call to the built-in print function, evaluates the string value, and gives that value to print, which writes the characters to the console.`, tryIt: `Change only the message. Predict the result before running it.` },
      { title: `2 · Source code is not the result`, body: `Source code is the instruction you wrote. Output is evidence of what happened after Python executed that instruction. Keeping these separate makes debugging much easier: you can ask what you told Python to do and, separately, what Python actually produced.`, code: `print("Dock open")`, breakdown: [{ part: `source code`, meaning: `The instruction written by the programmer.` }, { part: `output`, meaning: `The visible result produced after execution.` }], whatPythonDoes: `Python executes the instruction; the print function produces the visible text. The source line itself is not the output.`, tryIt: `Replace the message with your own and predict the output.` },
      { title: `3 · Syntax is the shape of an instruction`, body: `Syntax is the set of structural rules Python uses to recognise valid code. Think of it as grammar for instructions. Missing a quotation mark or parenthesis can make an instruction impossible to parse. Syntax is not decoration; it is how Python knows where parts of an instruction begin and end.`, code: `print("Ready")`, breakdown: [{ part: `print`, meaning: `The built-in function name.` }, { part: `( )`, meaning: `The boundaries of the function call.` }, { part: `"Ready"`, meaning: `A complete string literal.` }], whatPythonDoes: `Python must parse the structure before it can execute the statement. If the structure is incomplete, normal execution cannot begin.`, tryIt: `Remove the closing parenthesis, run it, and use the error as evidence.` },
      { title: `4 · Values are what instructions work with`, body: `Programs become useful when instructions can work with information. That information is represented by values: numbers, text, True and False, collections, and many other objects. A value is not merely something displayed on screen; it is something Python can store, pass, compare, transform, or use in a decision.`, code: `print(42)\nprint("42")`, breakdown: [{ part: `42`, meaning: `An integer value.` }, { part: `"42"`, meaning: `A string containing two characters.` }], whatPythonDoes: `Python treats these as different kinds of values. They can look similar when printed, but their types affect which operations are valid and what those operations mean.`, tryIt: `Change both values to 7 and "7", then try operations with each.` },
      { title: `5 · The same symbol can mean different things`, body: `Python does not decide an operation's meaning from the symbol alone. It considers the values involved. That is why + can perform arithmetic addition or string concatenation. Syntax and values work together to give code meaning.`, code: `print(10 + 5)\nprint("10" + "5")`, breakdown: [{ part: `10 + 5`, meaning: `Numeric addition.` }, { part: `"10" + "5"`, meaning: `Joining two strings.` }], whatPythonDoes: `The first expression produces 15. The second produces the string 105. The operator is the same, but the values give it its meaning.`, tryIt: `Try 10 + "5". Predict why Python rejects it before you run it.` },
      { title: `6 · Expressions are little questions Python can answer`, body: `An expression is code Python can evaluate to produce a value. 4 + 3 asks for an addition result. "A" + "B" asks for a new string. Larger programs are built by combining these small evaluations into useful instructions.`, code: `print(4 + 3)\nprint("A" + "B")\nprint(20 / 4)`, breakdown: [{ part: `4 + 3`, meaning: `An expression whose result is 7.` }, { part: `"A" + "B"`, meaning: `An expression whose result is "AB".` }, { part: `20 / 4`, meaning: `An expression whose result is 5.0.` }], whatPythonDoes: `Python evaluates each expression and then passes its resulting value to print.`, tryIt: `Write three expressions whose results you can predict without running them.` },
      { title: `7 · Execution is a journey through instructions`, body: `For a simple sequence of statements, Python normally moves through the source from top to bottom. This gives a program a timeline. Later, conditions and loops will change that path, but the basic idea remains: Python is continually determining which instruction comes next.`, code: `print("A")\nprint("B")\nprint("C")`, breakdown: [{ part: `first statement`, meaning: `Executes before the second and third.` }, { part: `second statement`, meaning: `Executes after A and before C.` }, { part: `third statement`, meaning: `Executes after B.` }], whatPythonDoes: `Python executes the three print statements in source order, producing A, B, C.`, tryIt: `Move C to the top. Predict the new output before running it.` },
      { title: `8 · Errors are evidence, not punishment`, body: `A syntax error means Python could not turn your source into a complete instruction. A TypeError means an operation is being attempted with values that do not fit that operation. Errors are useful evidence. Ask what assumption your code violated instead of treating the message as a punishment.`, code: `print("Harbor ready)`, breakdown: [{ part: `opening quote`, meaning: `Starts the string.` }, { part: `missing closing quote`, meaning: `Leaves the string unfinished.` }], whatPythonDoes: `Python reaches the end while still expecting the string to close, so it cannot parse the source as a complete instruction.`, tryIt: `Run it, read the error, repair exactly one thing, and run it again.` },
      { title: `9 · Prediction is part of programming`, body: `A strong programmer does not make every change and immediately press Run. Prediction creates a mental model. When your prediction is wrong, the difference between prediction and result tells you what you misunderstood. Use Predict → Run → Compare → Explain → Change one thing → Run again.`, code: `print("3" + "4")\nprint(3 + 4)`, breakdown: [{ part: `first line`, meaning: `Predict string concatenation.` }, { part: `second line`, meaning: `Predict numeric addition.` }], whatPythonDoes: `Python evaluates each expression according to the types of its values, so the two lines produce different results.`, tryIt: `Write your predicted outputs down before running the program.` },
      { title: `10 · This mental model scales`, body: `Everything later builds on these ideas. A variable gives a value a name. A condition chooses instructions. A loop repeats instructions. A function packages reusable behaviour. A list holds multiple values. A class defines a new kind of object. An API lets programs exchange structured information. The surface features change, but the underlying question stays the same: what instructions should Python execute, what values are involved, and what happens next?`, code: `status = "READY"\nprint(status)`, breakdown: [{ part: `status`, meaning: `A name used to refer to a value.` }, { part: `=`, meaning: `Assignment associates the name with the value on the right.` }, { part: `"READY"`, meaning: `The string value being assigned.` }], whatPythonDoes: `Python evaluates "READY", binds the name status to that value, then retrieves that value when print(status) executes.`, tryIt: `Change the assigned value and predict what the final print will show.` }
    ],
    question: `What is Python actually doing when you run a program?`,
    why: `A computer does not act on an intention. It follows instructions. Before variables, lists, loops, or functions make sense, you need a mental model of how Python reads an instruction, understands its syntax, works with values, executes it, and produces a result.`,
    steps: [
      `Start with a real problem: the Harbor needs to announce that its systems are online.`,
      `Write print("Harbor online"). Treat this as an instruction, not a line to memorize.`,
      `Read each part: print is a built-in function, the parentheses contain the value being passed to it, and the quotation marks tell Python that the value is text.`,
      `Run it and separate source code from output. The source is the instruction you wrote; the output is what Python produced after executing it.`,
      `Change only the text and run again. One change at a time makes the cause and effect visible.`,
      `Compare 42 with "42". They can look similar when printed, but one is a number and the other is text. That difference affects what Python can do with them.`,
      `Put several instructions together and predict their order. Python normally executes statements from top to bottom.`,
      `Break the code deliberately by removing a quotation mark. Read the error as information about what Python could not understand.`,
      `Use the same cycle throughout the lesson: understand the goal, predict, run, observe, explain, change one thing, and test again.`
    ],
    code: `print("Harbor online")`,
    codeBreakdown: [
      { part: `print`, meaning: `A built-in function that displays a value.` },
      { part: `( )`, meaning: `The boundaries of the function call; the value being passed goes inside them.` },
      { part: `"Harbor online"`, meaning: `A string value: text enclosed in quotation marks.` }
    ],
    whatPythonDoes: `Python recognizes print as a function call, evaluates the string value, passes that value to print, and the function writes the characters to the console. The quotation marks are syntax used to identify the text; they are not printed as part of the message.`,
    sourceVsResult: {
      source: `print("Harbor online")`,
      result: `Harbor online`,
      explanation: `Source code is the instruction. Output is the visible result after the instruction executes. Keeping those concepts separate makes debugging much easier.`
    },
    values: {
      title: `Why values matter`,
      examples: [
        { code: `print(42)`, explanation: `42 is an integer value.` },
        { code: `print("42")`, explanation: `"42" is a string containing the characters 4 and 2.` },
        { code: `print(10 + 5)`, explanation: `Python performs numeric addition and produces 15.` },
        { code: `print("10" + "5")`, explanation: `Python joins two strings and produces 105.` }
      ]
    },
    execution: {
      title: `How Python moves through a program`,
      code: `print("A")
print("B")
print("C")`,
      walkthrough: [
        `Python reaches the first statement and executes it.`,
        `The console receives A.`,
        `Python moves to the next statement and executes it.`,
        `The same happens for B and then C.`,
        `The program ends when there are no more statements to execute.`
      ]
    },
    experiment: {
      title: `Predict → Run → Compare`,
      instructions: `Predict all four outputs before running the code. Run it in Harbor Console. Then change exactly one line, predict again, and explain why the changed line produces a different result.`,
      code: `print(10)
print("10")
print(10 + 5)
print("10" + "5")`,
      observation: `The visible characters do not tell you everything about a value. Python's treatment of the values determines what operations mean.`
    },
    breakIt: {
      title: `Break it on purpose`,
      code: `print("Harbor online)`,
      prompt: `Predict what Python will complain about before you run it.`,
      explanation: `The opening quotation mark starts a string, but there is no closing quotation mark. Python reaches the end of the instruction while still looking for the string to end, so the source cannot be parsed as a complete instruction.`
    },
    commonMistakes: [
      { code: `print("Hello)`, problem: `The closing quotation mark is missing.`, fix: `print("Hello")` },
      { code: `print(Hello)`, problem: `Without quotation marks, Python treats Hello as a name rather than text.`, fix: `print("Hello")` },
      { code: `print("Hello"`, problem: `The function call is missing its closing parenthesis.`, fix: `print("Hello")` },
      { code: `print(10 + "5")`, problem: `A number and a string are different value types, so ordinary numeric addition cannot combine them this way.`, fix: `print(10 + 5)` }
    ],
    exercise: {
      title: `Build the Harbor startup message`,
      prompt: `Write three Python statements that display SYSTEM CHECK, DOCK READY, and HARBOR ONLINE in exactly that order. Then explain why separate statements make the program easier to change.`,
      answer: `print("SYSTEM CHECK")
print("DOCK READY")
print("HARBOR ONLINE")`,
      explanation: `Each print statement is a separate instruction. Their order is explicit, and one message can be changed or moved without rewriting the others.`
    },
    readCode: {
      title: `Read before you run`,
      code: `print("Dock")
print(7)
print("Dock" + "7")
print(7 + 7)`,
      prompt: `Predict the output of all four lines before running them. Then use Harbor Console to check your reasoning.`,
      answer: `Dock
7
Dock7
14`,
      explanation: `The first two lines display a string and a number. The third joins strings; the fourth adds numbers. The values determine what the operation means.`
    },
    prediction: {
      question: `Before you run it, what appears first?

print("C")
print("A")
print("B")`,
      options: [`C`, `A`, `B`, `Nothing`],
      correct: 0,
      explanation: `Python normally executes statements from top to bottom, so C is displayed first.`
    },
    quiz: {
      question: `Why are quotation marks necessary in print("Harbor online")?`,
      options: [
        `They tell Python that Harbor online is text.`,
        `They tell Python to print the quotation marks themselves.`,
        `They make print execute before other statements.`,
        `They are required around every Python function name.`
      ],
      correct: 0,
      explanation: `Quotation marks define a string literal and distinguish text from Python code.`
    },
    playgrounds: [
      {
        title: '01 · One instruction, one result',
        goal: 'See the simplest relationship between a Python instruction and what appears in the console.',
        code: `print("Launch sequence ready")`,
        predict: 'What exact characters will appear? Will the quotation marks appear too?',
        change: 'Replace the message with your own short status message.',
        notice: 'The quotation marks are part of the source syntax. They tell Python that the characters inside are text; they are not printed.'
      },
      {
        title: '02 · Number or text?',
        goal: 'Make the difference between a numeric value and a string visible.',
        code: `print(42)
print("42")`,
        predict: 'The output looks almost identical. What difference do you think Python sees?',
        change: 'Change 42 to 7, then change "42" to "7".',
        notice: 'Printing can make different types look similar. The type matters when you perform operations on the value.'
      },
      {
        title: '03 · Addition has a type',
        goal: 'Discover why the same-looking symbols can produce different results.',
        code: `print(10 + 5)
print("10" + "5")`,
        predict: 'Will both lines produce 15?',
        change: 'Try "10" + 5 and observe the error. Then explain why Python refuses it.',
        notice: 'The first + performs numeric addition. The second joins two strings. Python uses the types of the values to determine what the operation means.'
      },
      {
        title: '04 · Execution has an order',
        goal: 'Build a reliable mental model of top-to-bottom execution.',
        code: `print("FIRST")
print("SECOND")
print("THIRD")`,
        predict: 'Which word appears first, second, and third?',
        change: 'Move the THIRD line above the FIRST line before running it.',
        notice: 'For ordinary sequential statements, Python reaches and executes them in source order. Rearranging the instructions rearranges the result.'
      },
      {
        title: '05 · Expressions become values',
        goal: 'See that Python can evaluate an expression before passing its result to another operation.',
        code: `print(4 + 3)
print(10 - 6)
print(3 * 4)`,
        predict: 'What value will each expression produce before print displays it?',
        change: 'Replace one expression with 20 / 4.',
        notice: 'Python evaluates the expression first. The resulting value is then given to print.'
      },
      {
        title: '06 · Change exactly one thing',
        goal: 'Practice controlled experimentation instead of changing many things at once.',
        code: `print("DOCK READY")
print(12)
print(12 + 8)`,
        predict: 'Predict all three lines.',
        change: 'Change only 12 to 20 on the second line. Leave the third line untouched.',
        notice: 'A controlled change lets you identify cause and effect. The third line still uses its own expression, so changing the second line does not alter it.'
      },
      {
        title: '07 · Break the syntax',
        goal: 'Experience a syntax error and learn to treat the message as evidence.',
        code: `print("Harbor online)`,
        predict: 'What part of the instruction is unfinished?',
        change: 'Add the missing character and run it again.',
        notice: 'The string begins with a quotation mark but never closes. Python cannot finish parsing the instruction until the syntax is complete.'
      },
      {
        title: '08 · What is source and what is output?',
        goal: 'Stop confusing the instruction you write with the result Python produces.',
        code: `print("Python")
print(2026)`,
        predict: 'Which lines are source code, and what will the output contain?',
        change: 'Change 2026 to another number.',
        notice: 'Your source code is the set of instructions. The output is the visible result produced after those instructions execute.'
      },
      {
        title: '09 · Predict before pressing Run',
        goal: 'Turn prediction into a deliberate programming habit.',
        code: `print("A" + "B")
print(3 + 4)
print("3" + "4")`,
        predict: 'Write the three outputs down before running anything.',
        change: 'Change one line so that a number becomes text, or text becomes a number.',
        notice: 'Prediction forces you to reason about values and operations before Python confirms your answer.'
      },
      {
        title: '10 · Write your own tiny program',
        goal: 'Combine direct instructions, values, and execution order without copying a finished answer.',
        code: `print("SYSTEM CHECK")
print(3)
print("SYSTEM READY")`,
        predict: 'What will the console show, and in what order?',
        change: 'Replace the three lines with three messages or values that describe a process of your choice.',
        notice: 'You are now designing instructions rather than merely reading them. The important skill is being able to explain why each line exists.'
      }
    ,
    { title: "11 · Strings can be assembled", code: "name = \"Nova\"\nprint(\"Welcome, \" + name)", goal: "Change the name and the greeting. Predict the complete output before running." },
    { title: "12 · Arithmetic can be layered", code: "score = 10 + 5 * 2\nprint(score)", goal: "Predict the result before running. Then add parentheses and predict again." },
    { title: "13 · Parentheses change grouping", code: "print((10 + 5) * 2)", goal: "Compare this with print(10 + 5 * 2). Explain which operation Python performs first." },
    { title: "14 · A boolean is a value too", code: "online = True\nprint(online)", goal: "Change True to False and explain how the value, not the print operation, changed." },
    { title: "15 · Comparisons produce values", code: "print(10 > 3)\nprint(10 == 3)", goal: "Predict both boolean results and explain what each comparison asks." },
    { title: "16 · A function call can produce a value", code: "message = \"harbor\".upper()\nprint(message)", goal: "Change the text and predict the new value returned by the method call." },
    { title: "17 · Input begins as text", code: "raw = \"27\"\nprint(raw)\nprint(int(raw) + 3)", goal: "Explain why conversion is needed before numeric addition." },
    { title: "18 · Comments are for humans", code: "# The system is ready\nprint(\"READY\")", goal: "Add a comment explaining why the program is ready. Then change the code without changing the comment." },
    { title: "19 · Whitespace can affect readability", code: "first = 10\nsecond = 20\nprint(first + second)", goal: "Rename the values and format the code so another learner can understand it immediately." },
    { title: "20 · Combine the mental model", code: "name = \"Nova\"\nlevel = 3\nready = level >= 3\nprint(name)\nprint(ready)", goal: "Trace every line, predict the output, and explain where each value came from." }],
    exercises: [
      {
        title: '01 · Three-line status',
        prompt: 'Write three separate print statements that display STARTING, CHECKING, and READY in exactly that order.',
        hint: 'Each message can be its own string passed to print.',
        expected: 'Three output lines in the same order as the instructions.'
      },
      {
        title: '02 · Predict before coding',
        prompt: 'Without running anything, predict the output of print(8 + 2) and print("8" + "2"). Then write the two statements.',
        hint: 'Ask whether each value is a number or text.',
        expected: '10 on the first line and 82 on the second.'
      },
      {
        title: '03 · Repair the sentence',
        prompt: 'Fix this instruction so Python can execute it: print("System ready). Do not change the words.',
        hint: 'A string needs an opening and closing quotation mark.',
        expected: 'print("System ready")'
      },
      {
        title: '04 · Explain the parentheses',
        prompt: 'Write print("Hello") and explain, in your own words, what the parentheses are doing in this function call.',
        hint: 'Think about the value being passed into print.',
        expected: 'The parentheses contain the argument/value passed to the print function.'
      },
      {
        title: '05 · Number experiment',
        prompt: 'Write one statement that displays the result of 25 - 7. Then change only the numbers and predict the new result before running it.',
        hint: 'Keep the operator the same while changing the values.',
        expected: 'The first result is 18; the second depends on the chosen replacement values.'
      },
      {
        title: '06 · Text experiment',
        prompt: 'Create two strings and join them with + so the console displays a single word.',
        hint: 'For example, split a word into two pieces and join the pieces.',
        expected: 'Two string values are joined into one string.'
      },
      {
        title: '07 · Put the instructions in order',
        prompt: 'Write three print statements so the output reads ONE, TWO, THREE. Then swap two source lines and explain the change.',
        hint: 'The order of sequential statements is part of the program.',
        expected: 'The original output follows the original source order; swapping lines swaps their execution order.'
      },
      {
        title: '08 · Spot the type trap',
        prompt: 'Why does 10 + 5 work while 10 + "5" does not? Write a short explanation before changing the code.',
        hint: 'Compare the types of the two right-hand values.',
        expected: '10 and 5 are numbers; "5" is text. Ordinary numeric addition cannot combine an integer and a string.'
      },
      {
        title: '09 · Read, predict, run',
        prompt: 'Write a four-line program containing a string, an integer, a numeric expression, and a string expression. Predict every output before running it.',
        hint: 'Use print for each line and keep the four cases visibly different.',
        expected: 'The learner should be able to predict all four results and explain why each is produced.'
      },
      {
        title: '10 · First Contact challenge',
        prompt: 'Create a five-line mini program that announces a process, shows a number, performs a calculation, shows a text combination, and ends with a final message. Explain what Python does on each line.',
        hint: 'Do not search for a finished answer. Design the five instructions yourself.',
        expected: 'A working five-line program plus a line-by-line explanation of the values and execution order.'
      }
    ,
    { title: "11 · Assemble a message", prompt: "Create a name variable and combine it with a greeting so the program prints a personalised message.", hint: "Use a string variable and string concatenation." },
    { title: "12 · Operator prediction", prompt: "Predict the result of 10 + 5 * 2. Then write a second expression that makes addition happen first.", hint: "Parentheses can explicitly control grouping." },
    { title: "13 · Parentheses experiment", prompt: "Write two expressions containing the same numbers but different parentheses. Explain why the results differ.", hint: "Compare the order of evaluation." },
    { title: "14 · Boolean switch", prompt: "Create an online variable with True, print it, then change it to False and print it again. Explain what changed.", hint: "The variable holds a boolean value." },
    { title: "15 · Ask Python a question", prompt: "Write three comparisons whose results are True, False, and True. Print each result.", hint: "Comparisons produce boolean values." },
    { title: "16 · Transform text", prompt: "Take a lowercase string, call a string method on it, store the result, and print both the original and transformed values.", hint: "Keep the original value visible so you can compare it." },
    { title: "17 · Convert before calculating", prompt: "Start with the text \"27\" and produce the numeric result 30 using int(). Explain why the conversion is necessary.", hint: "The original characters are text." },
    { title: "18 · Comment with purpose", prompt: "Write a short program and add two comments that explain why the code exists rather than repeating what the syntax says.", hint: "A useful comment explains intent." },
    { title: "19 · Make the code readable", prompt: "Take a three-line calculation and rename its variables so a beginner can understand what each value represents.", hint: "Good names reduce the amount of explanation code needs." },
    { title: "20 · First Contact mini-system", prompt: "Build a small status report using a name, level, boolean readiness check, and at least two print calls. Predict the output before running.", hint: "Trace every value from its creation to its use." }],
    quizzes: [
      {
        question: 'What is the best description of source code?',
        options: ['The instructions written for Python to execute.', 'Only the text printed in the console.', 'The computer hardware running Python.', 'The error message produced by Python.'],
        correct: 0,
        explanation: 'Source code is the instructions you write. Output is a result produced after those instructions execute.'
      },
      {
        question: 'Why does print("42") treat 42 as text?',
        options: ['Quotation marks define a string literal.', 'print always converts numbers to text before reading them.', 'Parentheses turn every value into text.', 'Python cannot store numbers.'],
        correct: 0,
        explanation: 'Quotation marks tell Python that the characters inside represent a string.'
      },
      {
        question: 'What does 10 + 5 evaluate to?',
        options: ['15', '"105"', '105', 'An error'],
        correct: 0,
        explanation: 'Both operands are integers, so + performs numeric addition and produces 15.'
      },
      {
        question: 'What does "10" + "5" evaluate to?',
        options: ['15', '"105"', '105', 'An error'],
        correct: 1,
        explanation: 'Both operands are strings, so + joins their text and produces the string "105".'
      },
      {
        question: 'In ordinary sequential Python code, which statement normally runs first?',
        options: ['The first statement Python reaches.', 'The longest statement.', 'The statement with the largest number.', 'The last statement in the file.'],
        correct: 0,
        explanation: 'Python normally executes sequential statements from top to bottom.'
      },
      {
        question: 'Why does print(Hello) differ from print("Hello")?',
        options: ['Without quotes, Hello is interpreted as a name rather than a string literal.', 'Quotes make print run faster.', 'Parentheses only work with quoted text.', 'Both statements always mean exactly the same thing.'],
        correct: 0,
        explanation: 'Quotation marks distinguish text from identifiers such as variable names.'
      },
      {
        question: 'What is the main purpose of predicting output before running code?',
        options: ['To practice reasoning about what the program will do.', 'To make Python execute faster.', 'To avoid learning syntax.', 'To replace testing entirely.'],
        correct: 0,
        explanation: 'Prediction exposes your mental model. Running the code then lets you compare that model with reality.'
      },
      {
        question: 'What is wrong with print("Harbor online)?',
        options: ['The string has no closing quotation mark.', 'print cannot display text.', 'Harbor is a reserved keyword.', 'The word online must be a number.'],
        correct: 0,
        explanation: 'The opening quote begins a string, but the missing closing quote prevents Python from parsing a complete string literal.'
      },
      {
        question: 'Which statement best describes an expression?',
        options: ['Code that Python can evaluate to produce a value.', 'Only a comment.', 'A file name on your computer.', 'A Python error message.'],
        correct: 0,
        explanation: 'Expressions such as 4 + 3 can be evaluated to produce a value.'
      },
      {
        question: 'What is the strongest beginner habit from First Contact?',
        options: ['Predict, run, observe, explain, then change one thing.', 'Copy code without changing it.', 'Memorise every example exactly.', 'Avoid errors by never experimenting.'],
        correct: 0,
        explanation: 'Controlled experimentation builds understanding because you connect an intentional change with Python’s response.'
      }
    ,
    { question: "Which expression produces text by joining two strings?", options: ["\"A\" + \"B\"", "1 + 2", "1 > 2", "True and False"], correct: 0, explanation: "The + operator concatenates strings when both operands are strings." },
    { question: "What is the result of 10 + 5 * 2?", options: ["20", "30", "25", "150"], correct: 0, explanation: "Multiplication is evaluated before addition, so 5 * 2 becomes 10, then 10 + 10 becomes 20." },
    { question: "Which version forces addition before multiplication?", options: ["(10 + 5) * 2", "10 + (5 * 2)", "10 + 5 * 2", "10 * 5 + 2"], correct: 0, explanation: "Parentheses explicitly group 10 + 5 first." },
    { question: "What kind of value does 10 > 3 produce?", options: ["A boolean", "A string", "A list", "A function"], correct: 0, explanation: "A comparison produces True or False, which are boolean values." },
    { question: "What does int(\"27\") do?", options: ["Converts the text 27 into the integer 27", "Converts 27 into text", "Adds 27 to itself", "Prints the number automatically"], correct: 0, explanation: "int converts a numeric string into an integer when the text represents a valid integer." },
    { question: "Why can a comment be useful?", options: ["It can explain intent to people reading the code", "It makes Python execute faster", "It changes a variable's type", "It automatically fixes errors"], correct: 0, explanation: "Comments are ignored by Python's execution but can communicate intent to humans." },
    { question: "What happens when a variable is assigned a new value?", options: ["The name becomes associated with the new value", "The old value is printed automatically", "Python deletes the entire program", "The variable becomes a comment"], correct: 0, explanation: "Assignment updates what value the name refers to in the current program state." },
    { question: "Which is the clearest variable name for a player's score?", options: ["player_score", "x", "thing", "aaa"], correct: 0, explanation: "A descriptive name communicates what the value represents." },
    { question: "Why compare the original and transformed string?", options: ["It helps you see whether the operation created or changed the value you expect", "It makes Python ignore the result", "It prevents methods from running", "It converts every string to a number"], correct: 0, explanation: "Observing both values makes the effect of the transformation concrete." },
    { question: "What is the best way to understand a small new piece of code?", options: ["Predict, run, observe, explain, then change one thing", "Copy it repeatedly without running it", "Memorise every character first", "Change many lines at once"], correct: 0, explanation: "Controlled experimentation connects the code you wrote with Python's actual behaviour." }],
    nextIdea: `You can now give Python direct instructions and reason about values. The next problem is reuse: what if the same value needs a name so you can use or change it later? That is the problem variables solve.`
  },
  2: {
    question: `Why give a value a name instead of using the value everywhere?`,
    why: `A name lets you describe what a value means and change it in one place later.`,
    steps: [`Create a value, assign it to a descriptive name, then use that name twice. Notice that the name is a reference to the value.`],
    code: `crew_size = 4
message = 'Crew ready'
print(crew_size)
print(message)`,
    whatPythonDoes: `Python evaluates the right side first, then associates that value with the name on the left.`,
    exercise: `The Harbor has a crew count that changes every morning. What should you name the value so another reader knows what it means?`,
    answer: `Use a descriptive name such as crew_size.`,
    explanation: `Names make code readable and make changing a value easier.`,
    prediction: {

      question: `Before you run the example, predict: Why give a value a name instead of using the value everywhere?`,

      options: [`Use a descriptive name such as crew_size.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Names make code readable and make changing a value easier.`

    },

    quiz: {
      question: `Why give a value a name instead of using the value everywhere?`,
      options: [`Use a descriptive name such as crew_size.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Names make code readable and make changing a value easier.`
    }
  },
  3: {
    question: `Why do operators exist instead of writing every calculation by hand?`,
    why: `Operators let a program calculate, compare, and make logical decisions from changing values.`,
    steps: [`Evaluate an arithmetic expression, then compare its result. Notice that arithmetic gives a value while comparison gives True or False.`],
    code: `capacity = 12
occupied = 7
available = capacity - occupied
print(available)
print(available > 0)`,
    whatPythonDoes: `Python calculates the subtraction first, stores the result, then compares it with zero.`,
    exercise: `The dock has 12 places and 7 are occupied. Which operation answers 'how many places remain?'`,
    answer: `Subtract occupied from capacity.`,
    explanation: `Operators turn relationships between values into results Python can use.`,
    prediction: {

      question: `Before you run the example, predict: Why do operators exist instead of writing every calculation by hand?`,

      options: [`Subtract occupied from capacity.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Operators turn relationships between values into results Python can use.`

    },

    quiz: {
      question: `Why do operators exist instead of writing every calculation by hand?`,
      options: [`Subtract occupied from capacity.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Operators turn relationships between values into results Python can use.`
    }
  },
  4: {
    question: `Why treat text as data rather than just decoration?`,
    why: `Programs constantly receive names, messages, commands, and labels as text that must be inspected or changed.`,
    steps: [`Create one string, inspect one character, take a slice, then transform it. Each operation produces another value.`],
    code: `name = 'Harbor'
print(name[0])
print(name[1:4])
print(name.upper())`,
    whatPythonDoes: `Python stores the string as an ordered sequence of characters, so positions and slices can select pieces.`,
    exercise: `A command arrives as 'dock-open'. How would you create an uppercase version without changing the original text?`,
    answer: `Use command.upper().`,
    explanation: `String methods create transformed text while the original string remains unchanged.`,
    prediction: {

      question: `Before you run the example, predict: Why treat text as data rather than just decoration?`,

      options: [`Use command.upper().`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `String methods create transformed text while the original string remains unchanged.`

    },

    quiz: {
      question: `Why treat text as data rather than just decoration?`,
      options: [`Use command.upper().`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `String methods create transformed text while the original string remains unchanged.`
    }
  },
  5: {
    question: `Why put many related values into one list?`,
    why: `A list gives one name to a changing collection instead of forcing you to invent a variable for every item.`,
    steps: [`Create an empty list, add two values, inspect the first value, then add another. Notice that the collection grows.`],
    code: `tasks = []
tasks.append('inspect')
tasks.append('launch')
print(tasks[0])
tasks.append('report')
print(tasks)`,
    whatPythonDoes: `The list object stays the same collection while its contents change.`,
    exercise: `A harbor receives an unknown number of tasks. Why is a list a better fit than task1, task2, task3 variables?`,
    answer: `Because the collection can grow and be processed as one object.`,
    explanation: `Lists are useful when the number or contents of items can change.`,
    prediction: {

      question: `Before you run the example, predict: Why put many related values into one list?`,

      options: [`Because the collection can grow and be processed as one object.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Lists are useful when the number or contents of items can change.`

    },

    quiz: {
      question: `Why put many related values into one list?`,
      options: [`Because the collection can grow and be processed as one object.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Lists are useful when the number or contents of items can change.`
    }
  },
  6: {
    question: `Why use a tuple when a list already exists?`,
    why: `Sometimes a group of values describes one fixed structure and should not be changed accidentally.`,
    steps: [`Create a coordinate tuple, unpack it into names, and try to imagine changing one item. The failed change is useful information: the structure is protected.`],
    code: `point = (18, 42)
x, y = point
print(x)
print(y)`,
    whatPythonDoes: `Tuple unpacking assigns each position to a name, while tuple immutability prevents item replacement.`,
    exercise: `A harbor sensor reports a fixed latitude/longitude pair. Why might a tuple communicate that fixed structure better than a list?`,
    answer: `Because the pair is intended to stay together and unchanged.`,
    explanation: `Tuples communicate fixed, ordered data.`,
    prediction: {

      question: `Before you run the example, predict: Why use a tuple when a list already exists?`,

      options: [`Because the pair is intended to stay together and unchanged.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Tuples communicate fixed, ordered data.`

    },

    quiz: {
      question: `Why use a tuple when a list already exists?`,
      options: [`Because the pair is intended to stay together and unchanged.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Tuples communicate fixed, ordered data.`
    }
  },
  7: {
    question: `Why remove duplicates instead of merely checking them later?`,
    why: `A set represents membership directly when repeated copies of the same value carry no extra meaning.`,
    steps: [`Build a set from repeated values, test membership, and combine two sets. Notice that duplicates disappear automatically.`],
    code: `zones = {'north', 'south', 'north'}
print(zones)
print('south' in zones)`,
    whatPythonDoes: `A set keeps distinct members, so adding an existing member does not create another copy.`,
    exercise: `Two scanners report overlapping zone names. What structure naturally keeps only the unique zones?`,
    answer: `A set.`,
    explanation: `Sets model uniqueness and membership clearly.`,
    prediction: {

      question: `Before you run the example, predict: Why remove duplicates instead of merely checking them later?`,

      options: [`A set.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Sets model uniqueness and membership clearly.`

    },

    quiz: {
      question: `Why remove duplicates instead of merely checking them later?`,
      options: [`A set.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Sets model uniqueness and membership clearly.`
    }
  },
  8: {
    question: `Why use keys instead of remembering positions?`,
    why: `Structured information is easier to understand when each value has a meaningful label.`,
    steps: [`Create a dictionary, retrieve a value by key, change it, then add a new key. Compare this with remembering list indexes.`],
    code: `vessel = {'name': 'Aurora', 'status': 'ready'}
print(vessel['status'])
vessel['status'] = 'moving'
print(vessel)`,
    whatPythonDoes: `Python uses the key to locate the associated value; the meaning comes from the key name.`,
    exercise: `If a record has name, status, and destination, why is vessel['status'] clearer than vessel[1]?`,
    answer: `The key describes exactly what the value represents.`,
    explanation: `Dictionaries connect data to meaning through keys.`,
    prediction: {

      question: `Before you run the example, predict: Why use keys instead of remembering positions?`,

      options: [`The key describes exactly what the value represents.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Dictionaries connect data to meaning through keys.`

    },

    quiz: {
      question: `Why use keys instead of remembering positions?`,
      options: [`The key describes exactly what the value represents.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Dictionaries connect data to meaning through keys.`
    }
  },
  9: {
    question: `Why make a decision in code?`,
    why: `Real programs react to conditions: a door can be open, a score can pass, or a sensor can report a warning.`,
    steps: [`Create a condition, observe True or False, then place the action under if. Add else to handle the other possibility.`],
    code: `temperature = 31
if temperature > 30:
    print('Cooling needed')
else:
    print('Temperature normal')`,
    whatPythonDoes: `Python evaluates the condition first and executes only the matching branch.`,
    exercise: `A sensor reports 31 degrees. Which part of the program should decide whether cooling is needed?`,
    answer: `The if condition.`,
    explanation: `Conditionals turn changing information into controlled choices.`,
    prediction: {

      question: `Before you run the example, predict: Why make a decision in code?`,

      options: [`The if condition.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Conditionals turn changing information into controlled choices.`

    },

    quiz: {
      question: `Why make a decision in code?`,
      options: [`The if condition.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Conditionals turn changing information into controlled choices.`
    }
  },
  10: {
    question: `Why repeat code with a loop instead of copying it?`,
    why: `Repetition is common, but copied code becomes difficult to change and easy to get out of sync.`,
    steps: [`Give Python a collection, let for visit each item, and watch the same block run once per item.`],
    code: `for dock in ['A','B','C']:
    print('Checking', dock)`,
    whatPythonDoes: `Python takes one item at a time from the iterable and runs the indented block for that item.`,
    exercise: `Three docks need the same inspection. What changes between iterations?`,
    answer: `Only the current dock value changes.`,
    explanation: `A loop separates the repeated action from the changing item.`,
    prediction: {

      question: `Before you run the example, predict: Why repeat code with a loop instead of copying it?`,

      options: [`Only the current dock value changes.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `A loop separates the repeated action from the changing item.`

    },

    quiz: {
      question: `Why repeat code with a loop instead of copying it?`,
      options: [`Only the current dock value changes.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `A loop separates the repeated action from the changing item.`
    }
  },
  11: {
    question: `Why turn code into a function?`,
    why: `A function gives a useful action a name so the same idea can be called without rewriting its steps.`,
    steps: [`Define a function, give it an input, return a result, then call it with two different values.`],
    code: `def remaining(capacity, used):
    return capacity - used

print(remaining(12, 7))
print(remaining(20, 11))`,
    whatPythonDoes: `Python stores the function definition, then creates a fresh set of local values each time it is called.`,
    exercise: `If the same calculation appears in five places, what should you change first: every expression or the design?`,
    answer: `Create one function and reuse it.`,
    explanation: `Functions package a repeatable idea behind a meaningful name.`,
    prediction: {

      question: `Before you run the example, predict: Why turn code into a function?`,

      options: [`Create one function and reuse it.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Functions package a repeatable idea behind a meaningful name.`

    },

    quiz: {
      question: `Why turn code into a function?`,
      options: [`Create one function and reuse it.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Functions package a repeatable idea behind a meaningful name.`
    }
  },
  12: {
    question: `Why split a program into modules?`,
    why: `As a project grows, one file becomes difficult to navigate. Modules give related code a home.`,
    steps: [`Put related behavior in a module, import it, then call it. The important idea is ownership: each file has a responsibility.`],
    code: `# harbor_tools.py
# def greet(): ...

# main.py
from harbor_tools import greet
greet()`,
    whatPythonDoes: `Importing makes names from another module available to the current module.`,
    exercise: `A project has database helpers, formatting helpers, and API helpers. Why keep them in separate modules?`,
    answer: `Each module can own one related area of behavior.`,
    explanation: `Modules make larger programs easier to understand and reuse.`,
    prediction: {

      question: `Before you run the example, predict: Why split a program into modules?`,

      options: [`Each module can own one related area of behavior.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Modules make larger programs easier to understand and reuse.`

    },

    quiz: {
      question: `Why split a program into modules?`,
      options: [`Each module can own one related area of behavior.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Modules make larger programs easier to understand and reuse.`
    }
  },
  13: {
    question: `Why generate a collection instead of writing the loop manually?`,
    why: `When the rule for creating every item is short and clear, a comprehension can express the transformation directly.`,
    steps: [`Start with a normal loop, identify the value produced each time, then compress only after the logic is understood.`],
    code: `numbers = [1, 2, 3, 4]
squares = [n * n for n in numbers]
print(squares)`,
    whatPythonDoes: `Python visits each n, calculates n*n, and places the result into the new list.`,
    exercise: `You need the squared value of every sensor reading. What part changes for each reading?`,
    answer: `The current reading n.`,
    explanation: `A comprehension is a compact description of a collection-building rule.`,
    prediction: {

      question: `Before you run the example, predict: Why generate a collection instead of writing the loop manually?`,

      options: [`The current reading n.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `A comprehension is a compact description of a collection-building rule.`

    },

    quiz: {
      question: `Why generate a collection instead of writing the loop manually?`,
      options: [`The current reading n.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `A comprehension is a compact description of a collection-building rule.`
    }
  },
  14: {
    question: `Why pass a function to another function?`,
    why: `Sometimes the operation should be chosen separately from the data it operates on.`,
    steps: [`Define a function that accepts another function, then pass a small transformation into it.`],
    code: `def apply_twice(fn, value):
    return fn(fn(value))

print(apply_twice(lambda x: x + 1, 5))`,
    whatPythonDoes: `The outer function receives behavior as a value and calls it when needed.`,
    exercise: `If the data stays the same but the transformation changes, what should become a parameter?`,
    answer: `The function that performs the transformation.`,
    explanation: `Higher-order functions separate what to process from how to process it.`,
    prediction: {

      question: `Before you run the example, predict: Why pass a function to another function?`,

      options: [`The function that performs the transformation.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Higher-order functions separate what to process from how to process it.`

    },

    quiz: {
      question: `Why pass a function to another function?`,
      options: [`The function that performs the transformation.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Higher-order functions separate what to process from how to process it.`
    }
  },
  15: {
    question: `Why do type errors happen even when the syntax looks correct?`,
    why: `Python can parse valid code that still asks an object to perform an operation it does not support.`,
    steps: [`Compare adding two numbers with adding a number and text. The syntax is valid, but the types disagree.`],
    code: `count = 5
# print(count + '5')
print(count + 5)`,
    whatPythonDoes: `Python checks the actual objects involved in the operation and raises an error when the operation is not supported.`,
    exercise: `A value prints as 5, but adding it to '5' fails. What should you inspect first?`,
    answer: `The types of both values.`,
    explanation: `Type errors are often clues about a mismatch between the data you have and the operation you chose.`,
    prediction: {

      question: `Before you run the example, predict: Why do type errors happen even when the syntax looks correct?`,

      options: [`The types of both values.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Type errors are often clues about a mismatch between the data you have and the operation you chose.`

    },

    quiz: {
      question: `Why do type errors happen even when the syntax looks correct?`,
      options: [`The types of both values.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Type errors are often clues about a mismatch between the data you have and the operation you chose.`
    }
  },
  16: {
    question: `Why handle failure explicitly?`,
    why: `Programs interact with input, files, networks, and users; failure is normal, not exceptional in the everyday sense.`,
    steps: [`Put risky code in try, handle the known failure in except, and keep the program alive when recovery is possible.`],
    code: `try:
    value = int('dock')
except ValueError:
    value = 0
print(value)`,
    whatPythonDoes: `Python jumps to the matching except block when the conversion raises ValueError.`,
    exercise: `A user types a word where a number is expected. Should the entire program crash?`,
    answer: `Not necessarily; handle the invalid input and explain or recover.`,
    explanation: `Exception handling turns expected failure into controlled behavior.`,
    prediction: {

      question: `Before you run the example, predict: Why handle failure explicitly?`,

      options: [`Not necessarily; handle the invalid input and explain or recover.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Exception handling turns expected failure into controlled behavior.`

    },

    quiz: {
      question: `Why handle failure explicitly?`,
      options: [`Not necessarily; handle the invalid input and explain or recover.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Exception handling turns expected failure into controlled behavior.`
    }
  },
  17: {
    question: `Why read an error message instead of fearing it?`,
    why: `An error tells you where Python's mental model of the program stopped matching what your code asked it to do.`,
    steps: [`Read the exception type, then the final line of the traceback, then inspect the values involved.`],
    code: `value = 42
print(type(value).__name__)`,
    whatPythonDoes: `The exception class often tells you the category of failure; the traceback points toward where it surfaced.`,
    exercise: `A traceback mentions TypeError on a specific line. What should you inspect before changing random code?`,
    answer: `The values and operation on that line.`,
    explanation: `Debugging starts with evidence, not guesses.`,
    prediction: {

      question: `Before you run the example, predict: Why read an error message instead of fearing it?`,

      options: [`The values and operation on that line.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Debugging starts with evidence, not guesses.`

    },

    quiz: {
      question: `Why read an error message instead of fearing it?`,
      options: [`The values and operation on that line.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Debugging starts with evidence, not guesses.`
    }
  },
  18: {
    question: `Why persist data in files?`,
    why: `A variable disappears when the process ends; a file lets information survive beyond one run.`,
    steps: [`Open a file with a context manager, write text, close it automatically, then read it back.`],
    code: `with open('harbor_note.txt', 'w') as f:
    f.write('Dock ready')

with open('harbor_note.txt') as f:
    print(f.read())`,
    whatPythonDoes: `The with block manages the file resource so it is closed when the block finishes.`,
    exercise: `If a program records today's inspection and must show it tomorrow, where should the information live?`,
    answer: `Persistent storage such as a file or database.`,
    explanation: `Files let programs exchange and preserve information.`,
    prediction: {

      question: `Before you run the example, predict: Why persist data in files?`,

      options: [`Persistent storage such as a file or database.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Files let programs exchange and preserve information.`

    },

    quiz: {
      question: `Why persist data in files?`,
      options: [`Persistent storage such as a file or database.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Files let programs exchange and preserve information.`
    }
  },
  19: {
    question: `Why represent dates as date/time objects instead of strings?`,
    why: `Calendar arithmetic is easier and safer when Python knows that a value represents a date rather than arbitrary text.`,
    steps: [`Create two dates, subtract them, and inspect the resulting duration.`],
    code: `from datetime import date
start = date(2026, 8, 1)
end = date(2026, 8, 6)
print((end - start).days)`,
    whatPythonDoes: `Python can perform calendar-aware operations because the values carry date meaning.`,
    exercise: `If a deployment starts on Monday and ends Friday, what should Python calculate rather than making you count characters?`,
    answer: `The duration between two date objects.`,
    explanation: `Date/time types let programs reason about time rather than merely display it.`,
    prediction: {

      question: `Before you run the example, predict: Why represent dates as date/time objects instead of strings?`,

      options: [`The duration between two date objects.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Date/time types let programs reason about time rather than merely display it.`

    },

    quiz: {
      question: `Why represent dates as date/time objects instead of strings?`,
      options: [`The duration between two date objects.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Date/time types let programs reason about time rather than merely display it.`
    }
  },
  20: {
    question: `Why describe a text pattern instead of checking every character manually?`,
    why: `Regular expressions give a compact language for finding structured patterns inside larger text.`,
    steps: [`Create a pattern for three digits, search a string, and inspect whether a match exists.`],
    code: `import re
print(bool(re.search(r'\\d{3}', 'Dock 123')))`,
    whatPythonDoes: `The pattern describes the shape; the search engine looks for text that fits that shape.`,
    exercise: `A shipment code contains exactly three digits somewhere inside a message. What should describe the rule?`,
    answer: `A regular expression such as \\d{3}.`,
    explanation: `Regex is useful when the structure of the text matters more than its exact wording.`,
    prediction: {

      question: `Before you run the example, predict: Why describe a text pattern instead of checking every character manually?`,

      options: [`A regular expression such as \\d{3}.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Regex is useful when the structure of the text matters more than its exact wording.`

    },

    quiz: {
      question: `Why describe a text pattern instead of checking every character manually?`,
      options: [`A regular expression such as \\d{3}.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Regex is useful when the structure of the text matters more than its exact wording.`
    }
  },
  21: {
    question: `Why turn a group of related behavior into a class?`,
    why: `When data and the actions that belong to that data travel together, an object can represent that concept directly.`,
    steps: [`Define a class, create an instance, store state on it, and call a method that uses that state.`],
    code: `class Vessel:
    def __init__(self, name):
        self.name = name
    def report(self):
        return f'{self.name} ready'

v = Vessel('Aurora')
print(v.report())`,
    whatPythonDoes: `The instance stores its own name; the method uses that instance's state.`,
    exercise: `If every vessel needs a name and a report method, why repeat separate variables and functions?`,
    answer: `A class can define the shared structure and behavior once.`,
    explanation: `Classes model things that have both state and behavior.`,
    prediction: {

      question: `Before you run the example, predict: Why turn a group of related behavior into a class?`,

      options: [`A class can define the shared structure and behavior once.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Classes model things that have both state and behavior.`

    },

    quiz: {
      question: `Why turn a group of related behavior into a class?`,
      options: [`A class can define the shared structure and behavior once.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Classes model things that have both state and behavior.`
    }
  },
  22: {
    question: `Why scrape a page instead of copying information by hand?`,
    why: `When permitted, automation can turn repeated web extraction into a repeatable process.`,
    steps: [`Fetch a page, locate the relevant structure, extract the needed values, and store them in a usable form.`],
    code: `# Conceptual example
html = '<h2>Dock A</h2>'
print('Dock A' in html)`,
    whatPythonDoes: `The important separation is fetching, locating, extracting, and validating—not simply downloading a page.`,
    exercise: `A page contains hundreds of repeated entries. What should the program repeat instead of you?`,
    answer: `The extraction procedure.`,
    explanation: `Web scraping is structured extraction, not magic text copying.`,
    prediction: {

      question: `Before you run the example, predict: Why scrape a page instead of copying information by hand?`,

      options: [`The extraction procedure.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Web scraping is structured extraction, not magic text copying.`

    },

    quiz: {
      question: `Why scrape a page instead of copying information by hand?`,
      options: [`The extraction procedure.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Web scraping is structured extraction, not magic text copying.`
    }
  },
  23: {
    question: `Why isolate a project's dependencies?`,
    why: `Two projects may need different versions of the same package. Isolation prevents one project from disturbing another.`,
    steps: [`Create an environment, install the project's dependencies there, and run the project inside that environment.`],
    code: `# shell concept
# python -m venv .venv
# activate the environment`,
    whatPythonDoes: `The environment changes which Python packages the project can see without changing every project on the machine.`,
    exercise: `Project A needs one package version and Project B needs another. What boundary prevents conflict?`,
    answer: `Separate virtual environments.`,
    explanation: `Isolation makes dependencies predictable.`,
    prediction: {

      question: `Before you run the example, predict: Why isolate a project's dependencies?`,

      options: [`Separate virtual environments.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Isolation makes dependencies predictable.`

    },

    quiz: {
      question: `Why isolate a project's dependencies?`,
      options: [`Separate virtual environments.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Isolation makes dependencies predictable.`
    }
  },
  24: {
    question: `Why calculate statistics instead of relying on a single number?`,
    why: `A single measurement can hide variation, unusual values, and the shape of the data.`,
    steps: [`Start with a collection, calculate a summary, then ask what information that summary leaves out.`],
    code: `values = [8, 9, 10, 40]
print(sum(values) / len(values))`,
    whatPythonDoes: `The mean summarizes the group, but the 40 also tells you the data is uneven.`,
    exercise: `Two teams have the same average but very different spreads. What did the average fail to show?`,
    answer: `Variation or distribution.`,
    explanation: `Statistics helps you reason about a collection rather than one observation.`,
    prediction: {

      question: `Before you run the example, predict: Why calculate statistics instead of relying on a single number?`,

      options: [`Variation or distribution.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Statistics helps you reason about a collection rather than one observation.`

    },

    quiz: {
      question: `Why calculate statistics instead of relying on a single number?`,
      options: [`Variation or distribution.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Statistics helps you reason about a collection rather than one observation.`
    }
  },
  25: {
    question: `Why use a dataframe for tabular data?`,
    why: `Rows and columns have structure that becomes cumbersome to manage with nested lists alone.`,
    steps: [`Load a table, select a column, filter rows, and inspect the resulting table.`],
    code: `import pandas as pd
df = pd.DataFrame({'dock':['A','B'], 'load':[10,18]})
print(df[df['load'] > 10])`,
    whatPythonDoes: `Pandas keeps labels and tabular operations together so transformations read close to the question being asked.`,
    exercise: `If you need every dock whose load exceeds 10, what should the code express directly?`,
    answer: `A filter over the load column.`,
    explanation: `Pandas turns common table questions into composable operations.`,
    prediction: {

      question: `Before you run the example, predict: Why use a dataframe for tabular data?`,

      options: [`A filter over the load column.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Pandas turns common table questions into composable operations.`

    },

    quiz: {
      question: `Why use a dataframe for tabular data?`,
      options: [`A filter over the load column.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Pandas turns common table questions into composable operations.`
    }
  },
  26: {
    question: `Why connect Python to the web?`,
    why: `The web is a network of services; Python can request data, process it, and return useful results.`,
    steps: [`Separate the request, the response, the data extraction, and the action taken with that data.`],
    code: `# Conceptual request flow
# response = requests.get(url)
# data = response.json()`,
    whatPythonDoes: `A web response is not automatically the final answer; your program must interpret its contents.`,
    exercise: `If a service returns JSON describing weather, what does Python do next?`,
    answer: `Parse the response and use the fields it needs.`,
    explanation: `Python becomes more powerful when it can exchange data with other systems.`,
    prediction: {

      question: `Before you run the example, predict: Why connect Python to the web?`,

      options: [`Parse the response and use the fields it needs.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Python becomes more powerful when it can exchange data with other systems.`

    },

    quiz: {
      question: `Why connect Python to the web?`,
      options: [`Parse the response and use the fields it needs.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Python becomes more powerful when it can exchange data with other systems.`
    }
  },
  27: {
    question: `Why choose a document database for some data?`,
    why: `Some records naturally vary in shape, and forcing every record into identical columns can be awkward.`,
    steps: [`Imagine two vessel records with shared fields plus different metadata. A document model can keep each record together.`],
    code: `document = {'name':'Aurora','status':'ready','tags':['cargo','night']}
print(document['status'])`,
    whatPythonDoes: `A document stores related fields together and can represent nested data naturally.`,
    exercise: `Two vessels have different optional metadata. What database model may fit that variability naturally?`,
    answer: `A document database such as MongoDB.`,
    explanation: `Document databases can model flexible, nested records.`,
    prediction: {

      question: `Before you run the example, predict: Why choose a document database for some data?`,

      options: [`A document database such as MongoDB.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Document databases can model flexible, nested records.`

    },

    quiz: {
      question: `Why choose a document database for some data?`,
      options: [`A document database such as MongoDB.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Document databases can model flexible, nested records.`
    }
  },
  28: {
    question: `Why use an API instead of directly reaching into another program?`,
    why: `An API gives a defined boundary: inputs, outputs, rules, and errors can be understood without knowing the other system's internals.`,
    steps: [`Identify the endpoint, send the expected request, inspect the response, and handle failure.`],
    code: `# Conceptual API call
# GET /vessels/42
# -> JSON describing vessel 42`,
    whatPythonDoes: `The API contract tells your program how to communicate without exposing internal implementation.`,
    exercise: `If another service changes its internal database but keeps the same API contract, what should your client continue using?`,
    answer: `The API contract.`,
    explanation: `APIs are agreements between software systems.`,
    prediction: {

      question: `Before you run the example, predict: Why use an API instead of directly reaching into another program?`,

      options: [`The API contract.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `APIs are agreements between software systems.`

    },

    quiz: {
      question: `Why use an API instead of directly reaching into another program?`,
      options: [`The API contract.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `APIs are agreements between software systems.`
    }
  },
  29: {
    question: `Why design your own API carefully?`,
    why: `An API becomes a dependency for other code, so unclear names and inconsistent responses create problems for every consumer.`,
    steps: [`Choose resources, routes, inputs, outputs, status codes, and validation before writing handlers.`],
    code: `# Conceptual route
# GET /vessels/42
# returns a vessel representation`,
    whatPythonDoes: `The route is only one part of the contract; the response shape and failure behavior matter too.`,
    exercise: `If two endpoints report errors differently, what problem does that create for clients?`,
    answer: `Clients need special-case handling and become harder to maintain.`,
    explanation: `Good API design reduces surprise for consumers.`,
    prediction: {

      question: `Before you run the example, predict: Why design your own API carefully?`,

      options: [`Clients need special-case handling and become harder to maintain.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Good API design reduces surprise for consumers.`

    },

    quiz: {
      question: `Why design your own API carefully?`,
      options: [`Clients need special-case handling and become harder to maintain.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Good API design reduces surprise for consumers.`
    }
  },
  30: {
    question: `Why build a complete project instead of only isolated examples?`,
    why: `A project forces concepts to interact: data, functions, errors, persistence, interfaces, and testing become one system.`,
    steps: [`Break the capstone into a small contract, data model, core functions, interface, tests, and final polish.`],
    code: `# Harbor Master starts here
project = {'status': 'planning'}
print(project)`,
    whatPythonDoes: `A complete project reveals connections that isolated syntax examples cannot.`,
    exercise: `If the feature list is huge, what should you define first?`,
    answer: `A small useful version with a clear contract.`,
    explanation: `A capstone turns individual skills into system-building judgment.`,
    prediction: {

      question: `Before you run the example, predict: Why build a complete project instead of only isolated examples?`,

      options: [`A small useful version with a clear contract.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `A capstone turns individual skills into system-building judgment.`

    },

    quiz: {
      question: `Why build a complete project instead of only isolated examples?`,
      options: [`A small useful version with a clear contract.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `A capstone turns individual skills into system-building judgment.`
    }
  },
  31: {
    question: `Why isolate a workspace when the project already runs?`,
    why: `A working project today can become a broken project tomorrow if its dependencies change underneath it.`,
    steps: [`Create a virtual environment, activate it, install only what the project needs, and record those dependencies.`],
    code: `# python -m venv .venv
# activate .venv
# python -m pip install ...`,
    whatPythonDoes: `The environment becomes a reproducible boundary around the project's Python packages.`,
    exercise: `What prevents one project's package upgrade from silently changing another project's behavior?`,
    answer: `Dependency isolation.`,
    explanation: `Reproducibility starts with controlled environments.`,
    prediction: {

      question: `Before you run the example, predict: Why isolate a workspace when the project already runs?`,

      options: [`Dependency isolation.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Reproducibility starts with controlled environments.`

    },

    quiz: {
      question: `Why isolate a workspace when the project already runs?`,
      options: [`Dependency isolation.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Reproducibility starts with controlled environments.`
    }
  },
  32: {
    question: `Why record dependencies instead of telling teammates to install things manually?`,
    why: `A project is easier to reproduce when its required packages and versions are written down.`,
    steps: [`Install a dependency, record it, recreate an environment elsewhere, then verify the project starts.`],
    code: `# requirements.txt concept
# requests==...
# pandas==...`,
    whatPythonDoes: `A dependency file turns an informal setup process into a repeatable instruction.`,
    exercise: `A teammate gets your project but not your computer. What information do they need first?`,
    answer: `The project's dependency requirements.`,
    explanation: `Dependency files make setup repeatable.`,
    prediction: {

      question: `Before you run the example, predict: Why record dependencies instead of telling teammates to install things manually?`,

      options: [`The project's dependency requirements.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Dependency files make setup repeatable.`

    },

    quiz: {
      question: `Why record dependencies instead of telling teammates to install things manually?`,
      options: [`The project's dependency requirements.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Dependency files make setup repeatable.`
    }
  },
  33: {
    question: `Why test code that already appears to work?`,
    why: `A manual success proves one path; tests preserve expected behavior when the code changes later.`,
    steps: [`Write a small input/output expectation, run it, then change the implementation and see whether the test catches the regression.`],
    code: `def remaining(a, b):
    return a - b

assert remaining(10, 3) == 7`,
    whatPythonDoes: `The assertion records a contract that Python can check repeatedly.`,
    exercise: `If a refactor changes a correct result from 7 to 8, what should tell you immediately?`,
    answer: `A failing test.`,
    explanation: `Tests protect behavior against accidental changes.`,
    prediction: {

      question: `Before you run the example, predict: Why test code that already appears to work?`,

      options: [`A failing test.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Tests protect behavior against accidental changes.`

    },

    quiz: {
      question: `Why test code that already appears to work?`,
      options: [`A failing test.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Tests protect behavior against accidental changes.`
    }
  },
  34: {
    question: `Why use pytest rather than manually running every check?`,
    why: `A test runner discovers and executes many small checks consistently, giving fast feedback as a project grows.`,
    steps: [`Write focused tests, run the suite, read the failure, and fix the smallest cause.`],
    code: `def test_remaining():
    assert 10 - 3 == 7`,
    whatPythonDoes: `The runner turns many independent expectations into one repeatable feedback loop.`,
    exercise: `A project has 120 tests. Would you rather remember which 120 commands to run or let a test runner discover them?`,
    answer: `Let the test runner execute the suite.`,
    explanation: `Automation makes testing practical at scale.`,
    prediction: {

      question: `Before you run the example, predict: Why use pytest rather than manually running every check?`,

      options: [`Let the test runner execute the suite.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Automation makes testing practical at scale.`

    },

    quiz: {
      question: `Why use pytest rather than manually running every check?`,
      options: [`Let the test runner execute the suite.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Automation makes testing practical at scale.`
    }
  },
  35: {
    question: `Why debug systematically instead of changing random lines?`,
    why: `Random changes can hide the original cause. Evidence narrows the search.`,
    steps: [`Reproduce the failure, isolate the smallest failing case, inspect values, form one hypothesis, test it, then fix.`],
    code: `value = {'count': 3}
print(value['count'])`,
    whatPythonDoes: `A debugger or carefully placed inspection lets you see what the program actually contains.`,
    exercise: `If the result is wrong only for one input, what should you capture first?`,
    answer: `That exact input and the values produced along the failing path.`,
    explanation: `Debugging is a reasoning process.`,
    prediction: {

      question: `Before you run the example, predict: Why debug systematically instead of changing random lines?`,

      options: [`That exact input and the values produced along the failing path.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Debugging is a reasoning process.`

    },

    quiz: {
      question: `Why debug systematically instead of changing random lines?`,
      options: [`That exact input and the values produced along the failing path.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Debugging is a reasoning process.`
    }
  },
  36: {
    question: `Why keep logs when the program is not being watched?`,
    why: `Logs create a record of what the system was doing when nobody was staring at it.`,
    steps: [`Choose useful events, include context, assign levels, and avoid logging secrets.`],
    code: `import logging
logging.basicConfig(level=logging.INFO)
logging.info('Harbor started')`,
    whatPythonDoes: `A log becomes valuable when it answers what happened, when, and in which context.`,
    exercise: `A production job fails at 3 AM. What evidence could tell you what it was doing before failure?`,
    answer: `Useful logs.`,
    explanation: `Logging gives future-you evidence.`,
    prediction: {

      question: `Before you run the example, predict: Why keep logs when the program is not being watched?`,

      options: [`Useful logs.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Logging gives future-you evidence.`

    },

    quiz: {
      question: `Why keep logs when the program is not being watched?`,
      options: [`Useful logs.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Logging gives future-you evidence.`
    }
  },
  37: {
    question: `Why learn HTTP before building web integrations?`,
    why: `HTTP defines the conversation: method, URL, headers, status, and body each carry meaning.`,
    steps: [`Observe a request and response separately; then change one part and predict what should happen.`],
    code: `# GET asks for a representation
# POST commonly sends data to create/process something`,
    whatPythonDoes: `A 404 and a 500 both mean failure, but they communicate different causes.`,
    exercise: `If the resource cannot be found, which status family should you investigate?`,
    answer: `The 4xx client-error family, commonly 404 for not found.`,
    explanation: `HTTP is the grammar used by many web services.`,
    prediction: {

      question: `Before you run the example, predict: Why learn HTTP before building web integrations?`,

      options: [`The 4xx client-error family, commonly 404 for not found.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `HTTP is the grammar used by many web services.`

    },

    quiz: {
      question: `Why learn HTTP before building web integrations?`,
      options: [`The 4xx client-error family, commonly 404 for not found.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `HTTP is the grammar used by many web services.`
    }
  },
  38: {
    question: `Why extract structure from HTML instead of treating a page as one string?`,
    why: `HTML contains elements and relationships that are easier to reason about when parsed as a document.`,
    steps: [`Locate an element, inspect its text or attributes, then repeat only for the structure you actually need.`],
    code: `html = '<article><h2>Dock A</h2></article>'
print('Dock A' in html)`,
    whatPythonDoes: `A parser can distinguish elements from surrounding markup instead of relying on fragile string positions.`,
    exercise: `If a heading moves to another location in the HTML, why is a structural selector more reliable than character index 18?`,
    answer: `It follows the document structure.`,
    explanation: `Scraping becomes more robust when it follows structure.`,
    prediction: {

      question: `Before you run the example, predict: Why extract structure from HTML instead of treating a page as one string?`,

      options: [`It follows the document structure.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Scraping becomes more robust when it follows structure.`

    },

    quiz: {
      question: `Why extract structure from HTML instead of treating a page as one string?`,
      options: [`It follows the document structure.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Scraping becomes more robust when it follows structure.`
    }
  },
  39: {
    question: `Why use SQL instead of loading every record and filtering in Python?`,
    why: `The database can search, filter, sort, and aggregate data close to where it is stored.`,
    steps: [`State the question, express the filter, run the query, and inspect only the rows you need.`],
    code: `SELECT name FROM vessels WHERE status = 'ready';`,
    whatPythonDoes: `The database engine can perform the filtering before sending results back to your program.`,
    exercise: `A table has ten million rows but you need five. Where should the filtering happen?`,
    answer: `In the database query.`,
    explanation: `SQL describes the data question so the database can execute it efficiently.`,
    prediction: {

      question: `Before you run the example, predict: Why use SQL instead of loading every record and filtering in Python?`,

      options: [`In the database query.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `SQL describes the data question so the database can execute it efficiently.`

    },

    quiz: {
      question: `Why use SQL instead of loading every record and filtering in Python?`,
      options: [`In the database query.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `SQL describes the data question so the database can execute it efficiently.`
    }
  },
  40: {
    question: `Why start with SQLite?`,
    why: `SQLite provides a real relational database without requiring a separate server, making it ideal for learning and small applications.`,
    steps: [`Create a database, create a table, insert a row, query it, then inspect the result.`],
    code: `import sqlite3
con = sqlite3.connect(':memory:')
con.execute('CREATE TABLE dock (name TEXT)')
con.execute("INSERT INTO dock VALUES ('A')")
print(con.execute('SELECT name FROM dock').fetchone()[0])`,
    whatPythonDoes: `SQL statements describe database operations while Python manages the connection.`,
    exercise: `If your small local tool needs durable structured data but not a database server, what could be a simple starting point?`,
    answer: `SQLite.`,
    explanation: `SQLite teaches real relational concepts with very little setup.`,
    prediction: {

      question: `Before you run the example, predict: Why start with SQLite?`,

      options: [`SQLite.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `SQLite teaches real relational concepts with very little setup.`

    },

    quiz: {
      question: `Why start with SQLite?`,
      options: [`SQLite.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `SQLite teaches real relational concepts with very little setup.`
    }
  },
  41: {
    question: `Why move to PostgreSQL?`,
    why: `Larger multi-user applications need stronger server-side capabilities, concurrency, permissions, and operational tooling.`,
    steps: [`Connect through a driver, use parameterized queries, manage transactions, and close resources correctly.`],
    code: `# Conceptual PostgreSQL flow
# connect -> cursor -> parameterized query -> commit`,
    whatPythonDoes: `The application should send data separately from SQL structure so values cannot accidentally become SQL commands.`,
    exercise: `Why should user input not be concatenated directly into a SQL string?`,
    answer: `It can cause SQL injection and quoting errors.`,
    explanation: `PostgreSQL brings production-oriented relational capabilities.`,
    prediction: {

      question: `Before you run the example, predict: Why move to PostgreSQL?`,

      options: [`It can cause SQL injection and quoting errors.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `PostgreSQL brings production-oriented relational capabilities.`

    },

    quiz: {
      question: `Why move to PostgreSQL?`,
      options: [`It can cause SQL injection and quoting errors.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `PostgreSQL brings production-oriented relational capabilities.`
    }
  },
  42: {
    question: `Why store a document as one object?`,
    why: `Some application data is naturally nested and may not share exactly the same fields across records.`,
    steps: [`Represent a record as a document, query a field, and update a nested value.`],
    code: `document = {'vessel': {'name': 'Aurora', 'tags': ['night']}}
print(document['vessel']['name'])`,
    whatPythonDoes: `A document model keeps related nested information together.`,
    exercise: `If each product has different optional attributes, why can a document shape be convenient?`,
    answer: `The record can naturally contain only the attributes it has.`,
    explanation: `Document modeling is about matching storage structure to data shape.`,
    prediction: {

      question: `Before you run the example, predict: Why store a document as one object?`,

      options: [`The record can naturally contain only the attributes it has.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Document modeling is about matching storage structure to data shape.`

    },

    quiz: {
      question: `Why store a document as one object?`,
      options: [`The record can naturally contain only the attributes it has.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Document modeling is about matching storage structure to data shape.`
    }
  },
  43: {
    question: `Why make an API resource-oriented?`,
    why: `Consistent resources make an interface easier to predict, learn, and integrate.`,
    steps: [`Choose nouns for resources, HTTP methods for actions, status codes for outcomes, and stable response shapes.`],
    code: `# GET /vessels
# GET /vessels/42
# POST /vessels`,
    whatPythonDoes: `A client can learn one pattern and apply it to related resources.`,
    exercise: `If /vessels/42 identifies one vessel, what should the URL primarily describe?`,
    answer: `The resource, not an arbitrary function name.`,
    explanation: `A predictable API reduces cognitive load for consumers.`,
    prediction: {

      question: `Before you run the example, predict: Why make an API resource-oriented?`,

      options: [`The resource, not an arbitrary function name.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `A predictable API reduces cognitive load for consumers.`

    },

    quiz: {
      question: `Why make an API resource-oriented?`,
      options: [`The resource, not an arbitrary function name.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `A predictable API reduces cognitive load for consumers.`
    }
  },
  44: {
    question: `Why use FastAPI for a Python API?`,
    why: `FastAPI combines Python typing, validation, and HTTP routing so many API concerns can be expressed close to the code.`,
    steps: [`Define a route, declare its input, return structured data, then observe validation when the input is wrong.`],
    code: `# from fastapi import FastAPI
# app = FastAPI()
# @app.get('/dock')
# def dock(): return {'status':'ready'}`,
    whatPythonDoes: `The framework turns Python declarations into request handling and validation behavior.`,
    exercise: `If an endpoint expects an integer ID and receives text, what should validation do before your business logic runs?`,
    answer: `Reject invalid input clearly.`,
    explanation: `FastAPI lets the interface contract live close to the implementation.`,
    prediction: {

      question: `Before you run the example, predict: Why use FastAPI for a Python API?`,

      options: [`Reject invalid input clearly.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `FastAPI lets the interface contract live close to the implementation.`

    },

    quiz: {
      question: `Why use FastAPI for a Python API?`,
      options: [`Reject invalid input clearly.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `FastAPI lets the interface contract live close to the implementation.`
    }
  },
  45: {
    question: `Why validate and protect an API?`,
    why: `An API receives data from outside your program, so trust must stop at the boundary.`,
    steps: [`Validate shape and values, authenticate users where required, authorize actions, and avoid exposing secrets.`],
    code: `# Never hard-code API secrets
# Validate incoming data before using it`,
    whatPythonDoes: `Validation answers 'is this input acceptable?' while authorization answers 'is this user allowed to do this?'`,
    exercise: `A logged-in user asks to delete another user's data. Is authentication alone enough?`,
    answer: `No; authorization must also allow the action.`,
    explanation: `Security begins at every trust boundary.`,
    prediction: {

      question: `Before you run the example, predict: Why validate and protect an API?`,

      options: [`No; authorization must also allow the action.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Security begins at every trust boundary.`

    },

    quiz: {
      question: `Why validate and protect an API?`,
      options: [`No; authorization must also allow the action.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Security begins at every trust boundary.`
    }
  },
  46: {
    question: `Why does async code exist?`,
    why: `Some tasks spend time waiting for I/O. Async code lets the program make progress on other work during that wait.`,
    steps: [`Mark an operation async, await the slow operation, and run independent work without blocking the event loop.`],
    code: `import asyncio

async def ping():
    await asyncio.sleep(0.01)
    return 'pong'

print(asyncio.run(ping()))`,
    whatPythonDoes: `await pauses the current coroutine while other scheduled work can continue.`,
    exercise: `If a request spends most of its time waiting for a remote service, what resource can async code avoid leaving idle?`,
    answer: `The event loop thread.`,
    explanation: `Async is about managing waiting efficiently.`,
    prediction: {

      question: `Before you run the example, predict: Why does async code exist?`,

      options: [`The event loop thread.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Async is about managing waiting efficiently.`

    },

    quiz: {
      question: `Why does async code exist?`,
      options: [`The event loop thread.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Async is about managing waiting efficiently.`
    }
  },
  47: {
    question: `Why use threads when async is not the whole answer?`,
    why: `Some blocking operations or libraries are easier to run concurrently with threads.`,
    steps: [`Start two independent tasks in separate threads, wait for them, then compare the total waiting time.`],
    code: `from concurrent.futures import ThreadPoolExecutor

def read_dock(name):
    return f'{name} ready'

with ThreadPoolExecutor(max_workers=2) as pool:
    print(list(pool.map(read_dock, ['A','B'])))`,
    whatPythonDoes: `Threads share the process memory, which makes communication convenient but also means shared state needs care.`,
    exercise: `Two blocking I/O tasks can wait independently. What can threads help overlap?`,
    answer: `Waiting time for independent blocking operations.`,
    explanation: `Threads are useful when the work or library is blocking.`,
    prediction: {

      question: `Before you run the example, predict: Why use threads when async is not the whole answer?`,

      options: [`Waiting time for independent blocking operations.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Threads are useful when the work or library is blocking.`

    },

    quiz: {
      question: `Why use threads when async is not the whole answer?`,
      options: [`Waiting time for independent blocking operations.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Threads are useful when the work or library is blocking.`
    }
  },
  48: {
    question: `Why use multiple processes?`,
    why: `CPU-heavy work can benefit from separate processes that have separate Python interpreters.`,
    steps: [`Split independent CPU work across processes and collect the results rather than sharing one interpreter thread.`],
    code: `from multiprocessing import Pool

def square(n):
    return n * n

with Pool(2) as pool:
    print(pool.map(square, [1,2,3,4]))`,
    whatPythonDoes: `Separate processes can execute CPU work independently, at the cost of process and data-transfer overhead.`,
    exercise: `If the bottleneck is CPU calculation rather than waiting for a network response, what concurrency model is worth considering?`,
    answer: `Multiprocessing.`,
    explanation: `Processes are useful when independent CPU work can be distributed.`,
    prediction: {

      question: `Before you run the example, predict: Why use multiple processes?`,

      options: [`Multiprocessing.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Processes are useful when independent CPU work can be distributed.`

    },

    quiz: {
      question: `Why use multiple processes?`,
      options: [`Multiprocessing.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Processes are useful when independent CPU work can be distributed.`
    }
  },
  49: {
    question: `Why move long work out of a web request?`,
    why: `A user should not have to keep a browser request open while a large background task finishes.`,
    steps: [`Accept the request, enqueue work, return a task identifier, then let a worker process the job.`],
    code: `# request -> queue -> worker -> result
job = {'status': 'queued'}
print(job)`,
    whatPythonDoes: `The request becomes a quick handoff while the worker handles the slow operation.`,
    exercise: `A report takes five minutes to generate. Should the HTTP request necessarily remain open for five minutes?`,
    answer: `No; background processing is often a better design.`,
    explanation: `Queues separate accepting work from performing work.`,
    prediction: {

      question: `Before you run the example, predict: Why move long work out of a web request?`,

      options: [`No; background processing is often a better design.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Queues separate accepting work from performing work.`

    },

    quiz: {
      question: `Why move long work out of a web request?`,
      options: [`No; background processing is often a better design.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Queues separate accepting work from performing work.`
    }
  },
  50: {
    question: `Why measure performance instead of guessing?`,
    why: `A slow program may spend time somewhere very different from where you expect.`,
    steps: [`Measure a baseline, locate the expensive operation, change one thing, measure again, and compare.`],
    code: `import time
start = time.perf_counter()
sum(range(100000))
print(time.perf_counter() - start)`,
    whatPythonDoes: `A measurement gives evidence about elapsed time; profiling can reveal where that time is spent.`,
    exercise: `If a program feels slow, what should you establish before rewriting large sections?`,
    answer: `A measured baseline and likely bottleneck.`,
    explanation: `Optimization should follow evidence.`,
    prediction: {

      question: `Before you run the example, predict: Why measure performance instead of guessing?`,

      options: [`A measured baseline and likely bottleneck.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Optimization should follow evidence.`

    },

    quiz: {
      question: `Why measure performance instead of guessing?`,
      options: [`A measured baseline and likely bottleneck.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Optimization should follow evidence.`
    }
  },
  51: {
    question: `Why understand references and memory?`,
    why: `Two names can point to the same mutable object, so changing through one name can affect what the other name sees.`,
    steps: [`Create one list, assign a second name to it, mutate through one name, then compare both names.`],
    code: `items = ['A']
alias = items
alias.append('B')
print(items)`,
    whatPythonDoes: `Both names reference the same list object, so the mutation is visible through both names.`,
    exercise: `If changing alias also changes items, what relationship should you investigate?`,
    answer: `Whether both names reference the same mutable object.`,
    explanation: `Memory behavior becomes easier to reason about when you distinguish names from objects.`,
    prediction: {

      question: `Before you run the example, predict: Why understand references and memory?`,

      options: [`Whether both names reference the same mutable object.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Memory behavior becomes easier to reason about when you distinguish names from objects.`

    },

    quiz: {
      question: `Why understand references and memory?`,
      options: [`Whether both names reference the same mutable object.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Memory behavior becomes easier to reason about when you distinguish names from objects.`
    }
  },
  52: {
    question: `Why use NumPy arrays instead of ordinary Python lists for numerical work?`,
    why: `Numerical workloads often need compact storage and fast operations over many values.`,
    steps: [`Create an array, perform one vectorized operation, and compare the idea with a Python loop.`],
    code: `import numpy as np
values = np.array([1,2,3,4])
print(values * 2)`,
    whatPythonDoes: `The array operation applies to the whole collection without manually writing the loop.`,
    exercise: `If every value needs the same numerical transformation, what does vectorization let you express?`,
    answer: `The operation on the whole array.`,
    explanation: `NumPy turns many numerical operations into array-level expressions.`,
    prediction: {

      question: `Before you run the example, predict: Why use NumPy arrays instead of ordinary Python lists for numerical work?`,

      options: [`The operation on the whole array.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `NumPy turns many numerical operations into array-level expressions.`

    },

    quiz: {
      question: `Why use NumPy arrays instead of ordinary Python lists for numerical work?`,
      options: [`The operation on the whole array.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `NumPy turns many numerical operations into array-level expressions.`
    }
  },
  53: {
    question: `Why use Pandas when NumPy already handles arrays?`,
    why: `Real datasets have labels, columns, missing values, and mixed types that need table-oriented operations.`,
    steps: [`Create a DataFrame, select a named column, filter rows, and inspect the result.`],
    code: `import pandas as pd
df = pd.DataFrame({'dock':['A','B'], 'load':[8,16]})
print(df[df['load'] > 10])`,
    whatPythonDoes: `Pandas adds labeled, tabular operations around array-like data.`,
    exercise: `If the question is 'which docks have load above 10?', why is a labeled column useful?`,
    answer: `It lets the code express the question directly.`,
    explanation: `Pandas is designed around practical tabular analysis.`,
    prediction: {

      question: `Before you run the example, predict: Why use Pandas when NumPy already handles arrays?`,

      options: [`It lets the code express the question directly.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Pandas is designed around practical tabular analysis.`

    },

    quiz: {
      question: `Why use Pandas when NumPy already handles arrays?`,
      options: [`It lets the code express the question directly.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Pandas is designed around practical tabular analysis.`
    }
  },
  54: {
    question: `Why visualize data when the numbers are already available?`,
    why: `A table can hide trends that become obvious when values are placed on a visual scale.`,
    steps: [`Choose the question, select the relevant values, create a chart, then interpret what the visual reveals.`],
    code: `import matplotlib.pyplot as plt
plt.plot([1,2,3], [4,7,6])
plt.title('Dock activity')
plt.show()`,
    whatPythonDoes: `The chart is not the conclusion; it is a tool for noticing patterns and asking better questions.`,
    exercise: `If activity rises for three days and suddenly falls, what can a chart reveal faster than a raw list?`,
    answer: `The shape and timing of the trend.`,
    explanation: `Visualization supports reasoning; it does not replace it.`,
    prediction: {

      question: `Before you run the example, predict: Why visualize data when the numbers are already available?`,

      options: [`The shape and timing of the trend.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Visualization supports reasoning; it does not replace it.`

    },

    quiz: {
      question: `Why visualize data when the numbers are already available?`,
      options: [`The shape and timing of the trend.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Visualization supports reasoning; it does not replace it.`
    }
  },
  55: {
    question: `Why automate repetitive computer work with Python?`,
    why: `If the steps are predictable, a program can perform them consistently and leave people to handle exceptions and decisions.`,
    steps: [`Identify the repeated input, action, and output; write the smallest script that performs the action; then add safety checks.`],
    code: `from pathlib import Path
for path in Path('.').glob('*.txt'):
    print(path.name)`,
    whatPythonDoes: `Automation turns a repeated procedure into a reusable instruction.`,
    exercise: `If you rename 500 files using the same rule, what should you automate and what should you verify first?`,
    answer: `Automate the repeatable rename rule and verify a small sample first.`,
    explanation: `Good automation is repeatable and safe.`,
    prediction: {

      question: `Before you run the example, predict: Why automate repetitive computer work with Python?`,

      options: [`Automate the repeatable rename rule and verify a small sample first.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Good automation is repeatable and safe.`

    },

    quiz: {
      question: `Why automate repetitive computer work with Python?`,
      options: [`Automate the repeatable rename rule and verify a small sample first.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Good automation is repeatable and safe.`
    }
  },
  56: {
    question: `Why build a web application instead of only a script?`,
    why: `A web application gives many users a way to interact with the same Python-powered system through a browser.`,
    steps: [`Separate the request, application logic, data access, and response so each part has a clear responsibility.`],
    code: `# browser -> route -> Python logic -> response
print('Harbor web app')`,
    whatPythonDoes: `The browser is the interface; Python handles server-side behavior behind the interface.`,
    exercise: `If a button in the browser should create a record, what boundary receives that request?`,
    answer: `The web application's server-side route or handler.`,
    explanation: `Web applications connect user interaction to server-side logic.`,
    prediction: {

      question: `Before you run the example, predict: Why build a web application instead of only a script?`,

      options: [`The web application's server-side route or handler.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Web applications connect user interaction to server-side logic.`

    },

    quiz: {
      question: `Why build a web application instead of only a script?`,
      options: [`The web application's server-side route or handler.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Web applications connect user interaction to server-side logic.`
    }
  },
  57: {
    question: `Why organize a production API before it grows?`,
    why: `A large API becomes difficult to change when routes, validation, database code, and business rules are tangled together.`,
    steps: [`Separate routers, schemas, services, persistence, configuration, and tests; then trace one request through those layers.`],
    code: `# request -> router -> service -> repository -> database
print('request path')`,
    whatPythonDoes: `Each layer owns a narrower responsibility, making changes easier to reason about.`,
    exercise: `If a database implementation changes, which layer should ideally absorb most of that change?`,
    answer: `The persistence/repository layer.`,
    explanation: `Production structure is about keeping responsibilities understandable.`,
    prediction: {

      question: `Before you run the example, predict: Why organize a production API before it grows?`,

      options: [`The persistence/repository layer.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Production structure is about keeping responsibilities understandable.`

    },

    quiz: {
      question: `Why organize a production API before it grows?`,
      options: [`The persistence/repository layer.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Production structure is about keeping responsibilities understandable.`
    }
  },
  58: {
    question: `Why prepare configuration before deployment?`,
    why: `A program should not depend on your personal machine, hard-coded secrets, or undocumented setup steps.`,
    steps: [`Move environment-specific settings out of source code, define startup requirements, and test the production configuration.`],
    code: `# os.getenv('HARBOR_API_KEY')
print('configuration loaded')`,
    whatPythonDoes: `Configuration changes between environments while the application code remains the same.`,
    exercise: `Why should a database password not live directly in a committed source file?`,
    answer: `Anyone with access to the repository could obtain the secret.`,
    explanation: `Deployment begins with reproducible configuration.`,
    prediction: {

      question: `Before you run the example, predict: Why prepare configuration before deployment?`,

      options: [`Anyone with access to the repository could obtain the secret.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Deployment begins with reproducible configuration.`

    },

    quiz: {
      question: `Why prepare configuration before deployment?`,
      options: [`Anyone with access to the repository could obtain the secret.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Deployment begins with reproducible configuration.`
    }
  },
  59: {
    question: `Why monitor a system after it works?`,
    why: `A running service can fail, slow down, or return incorrect results after deployment. You need evidence to know what is happening.`,
    steps: [`Track health, errors, latency, and important events; then use those signals to investigate changes.`],
    code: `# /health -> service status
print('monitoring matters')`,
    whatPythonDoes: `Operations turns a deployed application into a system you can observe and maintain.`,
    exercise: `A service is technically running but every request takes five seconds. Is uptime alone enough?`,
    answer: `No; latency and user-facing behavior matter too.`,
    explanation: `Reliability requires observation, not just deployment.`,
    prediction: {

      question: `Before you run the example, predict: Why monitor a system after it works?`,

      options: [`No; latency and user-facing behavior matter too.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `Reliability requires observation, not just deployment.`

    },

    quiz: {
      question: `Why monitor a system after it works?`,
      options: [`No; latency and user-facing behavior matter too.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `Reliability requires observation, not just deployment.`
    }
  },
  60: {
    question: `Why finish with a capstone instead of another tutorial?`,
    why: `A real project forces you to decide what matters, connect multiple concepts, handle failure, and explain your design.`,
    steps: [`Define the smallest useful Harbor product, design its data, implement the core path, test it, then improve it based on evidence.`],
    code: `project = {'name':'Harbor Master','status':'building'}
print(project)`,
    whatPythonDoes: `The capstone is where syntax becomes engineering judgment: choosing boundaries, trade-offs, tests, and a usable result.`,
    exercise: `You have ten possible features and one weekend. What should decide the first feature?`,
    answer: `The smallest useful outcome and the problem it solves.`,
    explanation: `The final skill is not memorizing Python; it is using Python to build something deliberately.`,
    prediction: {

      question: `Before you run the example, predict: Why finish with a capstone instead of another tutorial?`,

      options: [`The smallest useful outcome and the problem it solves.`, `Ignore the values and copy the example`, `Change unrelated code first`],

      correct: 0,

      explanation: `The final skill is not memorizing Python; it is using Python to build something deliberately.`

    },

    quiz: {
      question: `Why finish with a capstone instead of another tutorial?`,
      options: [`The smallest useful outcome and the problem it solves.`, `Ignore the values and copy the example`, `Change unrelated code first`],
      correct: 0,
      explanation: `The final skill is not memorizing Python; it is using Python to build something deliberately.`
    }
  },
}

function LessonPredictionPanel({
  data,
  choice,
  onChoose,
  darkMode,
  panel,
  line,
  muted,
  sea,
}: {
  data?: {
    question: string
    options: string[]
    correct: number
    explanation: string
  }
  choice: string | null
  onChoose: (value: string) => void
  darkMode: boolean
  panel: string
  line: string
  muted: string
  sea: string
}) {
  if (!data) return null

  const answered = choice !== null
  const selectedIndex = answered ? data.options.indexOf(choice) : -1

  return (
    <section
      style={{
        marginTop: 16,
        padding: 20,
        border: `1px solid ${line}`,
        borderRadius: 14,
        background: panel,
      }}
    >
      <div
        style={{
          fontSize: 10.8,
          fontWeight: 900,
          color: sea,
          letterSpacing: '.14em',
          textTransform: 'uppercase',
        }}
      >
        PREDICT BEFORE YOU RUN
      </div>

      <h3 style={{ margin: '8px 0 6px', fontSize: 19.2 }}>
        {data.question}
      </h3>

      <p
        style={{
          margin: '0 0 14px',
          color: muted,
          fontSize: 13.2,
          lineHeight: 1.7,
        }}
      >
        Stop here before running the code. Make a prediction first.
        Then test it in Harbor Console and compare your prediction with
        Python's actual result.
      </p>

      <div style={{ display: 'grid', gap: 8 }}>
        {data.options.map((option, index) => {
          const selected = choice === option
          const correct = answered && index === data.correct

          return (
            <button
              key={`${index}-${option}`}
              type="button"
              onClick={() => onChoose(option)}
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '10px 12px',
                borderRadius: 10,
                border: `1px solid ${correct ? sea : line}`,
                background: correct
                  ? darkMode ? '#102B25' : '#EEF8F4'
                  : selected
                    ? darkMode ? '#182824' : '#F3F7F5'
                    : 'transparent',
                color: correct ? sea : undefined,
                cursor: 'pointer',
              }}
            >
              <strong style={{ marginRight: 8 }}>
                {String.fromCharCode(65 + index)}.
              </strong>
              {option}
            </button>
          )
        })}
      </div>

      {answered && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 10,
            background: darkMode ? '#10231F' : '#F0F7F4',
            color: muted,
            fontSize: 13.2,
            lineHeight: 1.7,
          }}
        >
          <strong style={{ color: sea }}>
            {selectedIndex === data.correct
              ? 'Prediction correct.'
              : 'Now compare your prediction with Python’s result.'}
          </strong>{' '}
          {data.explanation}
        </div>
      )}
    </section>
  )
}


function QuizCard({
  number,
  data,
  darkMode,
  panel,
  panel2,
  line,
  ink,
  muted,
  sea,
  seaSoft,
  result,
  onGrade,
}: {
  number: number
  data: { question: string; options: string[]; correct: number; explanation: string }
  darkMode: boolean
  panel: string
  panel2: string
  line: string
  ink: string
  muted: string
  sea: string
  seaSoft: string
  result: { selected: number; correct: boolean; earned: number } | undefined
  onGrade: (choice: number) => void
}) {
  const [choice, setChoice] = useState<number | null>(result?.selected ?? null)

  const hasResult = Boolean(result)
  const isCorrect = result?.correct ?? false

  return (
    <div
      style={{
        padding: 18,
        border: `1px solid ${
          hasResult
            ? isCorrect
              ? '#55A982'
              : '#C94A42'
            : line
        }`,
        borderRadius: 13,
        background: panel,
      }}
    >
      <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.12em', textTransform: 'uppercase' }}>
        QUESTION {String(number).padStart(2, '0')} · 5 PTS
      </div>

      <p style={{ margin: '9px 0 12px', color: ink, fontSize: 15.6, fontWeight: 750, lineHeight: 1.7 }}>
        {data.question}
      </p>

      {data.options.map((answer, i) => (
        <button
          key={answer}
          type="button"
          onClick={() => {
            if (!hasResult) setChoice(i)
          }}
          style={{
            display: 'block',
            width: '100%',
            textAlign: 'left',
            marginTop: 8,
            padding: 11,
            border: `1px solid ${
              choice === i
                ? hasResult
                  ? i === data.correct
                    ? '#55A982'
                    : '#C94A42'
                  : sea
                : line
            }`,
            borderRadius: 9,
            background:
              choice === i
                ? hasResult
                  ? i === data.correct
                    ? (darkMode ? '#123126' : '#ECF8F1')
                    : (darkMode ? '#321F1E' : '#FFF1EF')
                  : seaSoft
                : panel2,
            color: ink,
            cursor: hasResult ? 'default' : 'pointer',
            fontSize: 13.2,
          }}
        >
          {String.fromCharCode(65 + i)}. {answer}
        </button>
      ))}

      {!hasResult && (
        <button
          type="button"
          disabled={choice === null}
          onClick={() => {
            if (choice !== null) onGrade(choice)
          }}
          style={{
            marginTop: 13,
            border: 'none',
            borderRadius: 9,
            padding: '10px 14px',
            background: choice === null ? '#78968D' : sea,
            color: '#fff',
            cursor: choice === null ? 'not-allowed' : 'pointer',
            fontSize: 12,
            fontWeight: 900,
          }}
        >
          Submit Answer ✓
        </button>
      )}

      {hasResult && (
        <div
          style={{
            marginTop: 13,
            padding: 13,
            borderRadius: 10,
            background: isCorrect
              ? (darkMode ? '#123126' : '#ECF8F1')
              : (darkMode ? '#321F1E' : '#FFF1EF'),
            color: muted,
            fontSize: 13.2,
            lineHeight: 1.75,
          }}
        >
          <strong style={{ color: isCorrect ? sea : '#C94A42' }}>
            {isCorrect ? '✓ Correct · 5/5 points' : '✕ Not quite · 0/5 points'}
          </strong>

          <div style={{ marginTop: 6 }}>
            {isCorrect
              ? data.explanation
              : `The correct answer is ${String.fromCharCode(65 + data.correct)}. ${data.explanation}`}
          </div>

          {!isCorrect && (
            <div style={{ marginTop: 7 }}>
              <strong>Why your choice was not correct:</strong>{' '}
              The selected option does not match the Python concept being tested. Re-read the explanation,
              then compare it with the answer you selected.
            </div>
          )}
        </div>
      )}
      </div>
  )
}

export default function Practice() {
  const [selected, setSelected] = useState<Problem>(problems[0])
  const [selectedLessonNumber, setSelectedLessonNumber] = useState(1)
  const [code, setCode] = useState(problems[0].starterCode)
  const [darkMode, setDarkMode] = useState(false)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [levelFilter, setLevelFilter] = useState<'All' | 'Beginner' | 'Intermediate' | 'Hard'>('All')
  const [curriculumNarrow, setCurriculumNarrow] = useState(false)
  const [consoleNarrow, setConsoleNarrow] = useState(false)
  const [consoleOpen, setConsoleOpen] = useState(false)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const [panelFocus, setPanelFocus] = useState<'none' | 'curriculum' | 'console'>('none')
  const [curriculumWidth, setCurriculumWidth] = useState(255)
  const [consoleWidth, setConsoleWidth] = useState(560)
  const [draggingPanel, setDraggingPanel] = useState<'curriculum' | 'console' | null>(null)

  const curriculumPanelWidth = curriculumNarrow ? 190 : curriculumWidth
  const consolePanelWidth = consoleNarrow ? 330 : consoleWidth

  const curriculumFontScale = Math.max(
    0.86,
    Math.min(1.24, curriculumPanelWidth / 255),
  )
  const consoleFontScale = Math.max(
    0.88,
    Math.min(1.2, consolePanelWidth / 410),
  )

  const curriculumFontWeight = Math.round(
    700 + ((curriculumFontScale - 0.86) / (1.24 - 0.86)) * 180,
  )
  const consoleFontWeight = Math.round(
    650 + ((consoleFontScale - 0.88) / (1.2 - 0.88)) * 200,
  )
  const deckRef = useRef<HTMLDivElement | null>(null)
  const articleScrollRef = useRef<HTMLElement | null>(null)
  const activeDragRef = useRef<{
    panel: 'curriculum' | 'console'
    startX: number
    startCurriculumWidth: number
    startConsoleWidth: number
  } | null>(null)
  const [activeTab, setActiveTab] = useState('Learn')
  const [output, setOutput] = useState('')
  const [running, setRunning] = useState(false)
  const [solvedIds, setSolvedIds] = useState<number[]>([])
  const [clearedLessons, setClearedLessons] = useState<number[]>([])
  const [progressHydrated, setProgressHydrated] = useState(false)

  const PROGRESS_KEY = 'hackersharbor-python-progress-v1'
  const CODE_KEY_PREFIX = 'hackersharbor-python-code-'

  useEffect(() => {
    const article = articleScrollRef.current
    if (!article) return

    const handleScroll = () => {
      setShowBackToTop(article.scrollTop > 320)
    }

    handleScroll()
    article.addEventListener('scroll', handleScroll, { passive: true })
    return () => article.removeEventListener('scroll', handleScroll)
  }, [activeTab, selectedLessonNumber])

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(PROGRESS_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed.clearedLessons)) {
          setClearedLessons(
            parsed.clearedLessons.filter(
              (n: unknown): n is number =>
                typeof n === 'number' && n >= 1 && n <= curriculumLessons.length,
            ),
          )
        }
        if (
          typeof parsed.selectedLessonNumber === 'number' &&
          parsed.selectedLessonNumber >= 1 &&
          parsed.selectedLessonNumber <= curriculumLessons.length
        ) {
          setSelectedLessonNumber(parsed.selectedLessonNumber)
        }
        if (
          parsed.activeTab === 'Learn' ||
          parsed.activeTab === 'Examples' ||
          parsed.activeTab === 'Exercises' ||
          parsed.activeTab === 'Quiz' ||
          parsed.activeTab === 'Reference'
        ) {
          setActiveTab(parsed.activeTab)
        }
      }
    } catch {
      // Ignore malformed local progress.
    } finally {
      setProgressHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!progressHydrated) return
    try {
      window.localStorage.setItem(
        PROGRESS_KEY,
        JSON.stringify({
          clearedLessons,
          selectedLessonNumber,
          activeTab,
          savedAt: Date.now(),
        }),
      )
    } catch {
      // Storage may be unavailable.
    }
  }, [clearedLessons, selectedLessonNumber, activeTab, progressHydrated])

  useEffect(() => {
    if (!progressHydrated) return
    try {
      const savedCode = window.localStorage.getItem(
        `${CODE_KEY_PREFIX}${selectedLessonNumber}`,
      )
      if (savedCode !== null) setCode(savedCode)
    } catch {
      // Ignore unavailable storage.
    }
  }, [selectedLessonNumber, progressHydrated])

  useEffect(() => {
    if (!progressHydrated) return
    try {
      window.localStorage.setItem(
        `${CODE_KEY_PREFIX}${selectedLessonNumber}`,
        code,
      )
    } catch {
      // Ignore unavailable storage.
    }
  }, [code, selectedLessonNumber, progressHydrated])
  const [lessonQuizChoice, setLessonQuizChoice] = useState<number | null>(null)
  const [lessonPrediction, setLessonPrediction] = useState<string | null>(null)
  const [exerciseResults, setExerciseResults] = useState<Record<string, {
    status: 'correct' | 'incorrect' | 'error'
    output: string
    earned: number
  }>>({})
  const [quizResults, setQuizResults] = useState<Record<string, {
    selected: number
    correct: boolean
    earned: number
  }>>({})

  const editorRef = useRef<HTMLTextAreaElement | null>(null)
  const pythonWorkerRef = useRef<Worker | null>(null)
  const pendingRunRef = useRef<Map<string, { resolve: (value: any) => void; reject: (reason?: any) => void }>>(new Map())

  useEffect(() => {
    try {
      const theme = localStorage.getItem('hackersharbor-theme')
      const solved = localStorage.getItem('hackersharbor-solved-problems')
      if (theme) setDarkMode(theme === 'dark')
      if (solved) {
        const parsed = JSON.parse(solved)
        if (Array.isArray(parsed)) setSolvedIds(parsed)
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem('hackersharbor-theme', darkMode ? 'dark' : 'light')
      localStorage.setItem('hackersharbor-solved-problems', JSON.stringify(solvedIds))
    } catch {}
  }, [darkMode, solvedIds])

  const filtered = useMemo(() => {
    const levelMatches = (problem: Problem) => {
      if (levelFilter === 'All') return true
      if (levelFilter === 'Beginner') return problem.difficulty === 'Easy'
      if (levelFilter === 'Intermediate') return problem.difficulty === 'Medium'
      return problem.difficulty === 'Hard'
    }

    return problems.filter((p) => {
      const difficultyMatch = filter === 'All' || p.difficulty === filter
      const levelMatch = levelMatches(p)
      const searchMatch =
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase()) ||
        p.tags.some((tag) => tag.toLowerCase().includes(search.toLowerCase()))

      return difficultyMatch && levelMatch && searchMatch
    })
  }, [filter, levelFilter, search])

  const selectedProblem =
    problems.find((p) => p.id === selected.id) ?? problems[0]

  const solvedCount = solvedIds.length
  const progress = Math.round((Math.min(solvedCount, curriculumLessons.length) / curriculumLessons.length) * 100)
  const isSolved = solvedIds.includes(selectedProblem.id)

  const bg = darkMode ? '#071016' : '#F4F7F4'
  const panel = darkMode ? '#0B171D' : '#FFFFFF'
  const panel2 = darkMode ? '#0E2027' : '#F9FCF9'
  const ink = darkMode ? '#E8F2EE' : '#13231D'
  const muted = darkMode ? '#8FA9A0' : '#65756E'
  const line = darkMode ? '#193039' : '#DCE6E0'

  useEffect(() => {
    if (typeof window === 'undefined' || typeof Worker === 'undefined') {
      return
    }

    const worker = new Worker('/workers/python.worker.js')
    pythonWorkerRef.current = worker

    const handleMessage = (event: MessageEvent) => {
      const message = event.data
      if (!message?.id) return

      const pending = pendingRunRef.current.get(message.id)
      if (!pending) return

      pendingRunRef.current.delete(message.id)

      if (message.type === 'result') {
        pending.resolve(message.result)
      } else if (message.type === 'error') {
        pending.reject(
          new Error(
            message.error ||
              message.message ||
              'Python worker error.',
          ),
        )
      }
    }

    const handleWorkerError = (event: ErrorEvent) => {
      const message =
        event.message ||
        'The Python worker failed to start or crashed.'

      pendingRunRef.current.forEach(({ reject }) => {
        reject(new Error(message))
      })
      pendingRunRef.current.clear()
    }

    worker.addEventListener('message', handleMessage)
    worker.addEventListener('error', handleWorkerError)

    return () => {
      worker.removeEventListener('message', handleMessage)
      worker.removeEventListener('error', handleWorkerError)
      worker.terminate()
      pythonWorkerRef.current = null

      pendingRunRef.current.forEach(({ reject }) => {
        reject(new Error('Python worker stopped.'))
      })
      pendingRunRef.current.clear()
    }
  }, [])

  const executePythonInWorker = (
    sourceCode: string,
  ): Promise<any> => {
    const worker = pythonWorkerRef.current

    if (!worker) {
      return Promise.reject(
        new Error(
          'Python worker is not available. Refresh the page and try again.',
        ),
      )
    }

    const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`

    return new Promise((resolve, reject) => {
      let settled = false

      const finish = (
        callback: (value: any) => void,
        value: any,
      ) => {
        if (settled) return
        settled = true
        window.clearTimeout(timeout)
        pendingRunRef.current.delete(id)
        callback(value)
      }

      const timeout = window.setTimeout(() => {
        finish(
          reject,
          new Error(
            'Python is taking too long to start. The worker may be blocked or unavailable.',
          ),
        )
      }, 45000)

      pendingRunRef.current.set(id, {
        resolve: (value) => finish(resolve, value),
        reject: (error) => finish(reject, error),
      })

      try {
        worker.postMessage({
          id,
          type: 'execute',
          code: sourceCode,
        })
      } catch (error) {
        finish(reject, error)
      }
    })
  }

  const sea = '#0E7564'
  const seaSoft = darkMode ? '#103A34' : '#E3F3EE'
  const orange = '#E06D32'
  const editor = darkMode ? '#061014' : '#10201B'

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = activeDragRef.current
      const deck = deckRef.current
      if (!drag || !deck || panelFocus !== 'none') return

      const deckWidth = deck.getBoundingClientRect().width
      const delta = event.clientX - drag.startX

      if (drag.panel === 'curriculum') {
        // Keep the center learning area usable.
        const maxWidth = Math.max(
          190,
          Math.min(420, deckWidth - consoleWidth - 360 - 14),
        )
        const next = Math.min(
          maxWidth,
          Math.max(190, drag.startCurriculumWidth + delta),
        )
        setCurriculumWidth(next)
        setCurriculumNarrow(false)
      } else {
        // Keep the center learning area usable.
        const maxWidth = Math.max(
          330,
          Math.min(760, deckWidth - curriculumWidth - 360 - 14),
        )
        const next = Math.min(
          maxWidth,
          Math.max(330, drag.startConsoleWidth - delta),
        )
        setConsoleWidth(next)
        setConsoleNarrow(false)
      }
    }

    const stopDragging = () => {
      activeDragRef.current = null
      setDraggingPanel(null)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', stopDragging)
    window.addEventListener('pointercancel', stopDragging)

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', stopDragging)
      window.removeEventListener('pointercancel', stopDragging)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [consoleWidth, curriculumWidth, panelFocus])

  const beginPanelDrag = (
    panel: 'curriculum' | 'console',
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (panelFocus !== 'none') return

    event.preventDefault()
    activeDragRef.current = {
      panel,
      startX: event.clientX,
      startCurriculumWidth: curriculumWidth,
      startConsoleWidth: consoleWidth,
    }
    setDraggingPanel(panel)
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const gradeExercise = async (exerciseIndex: number) => {
    const exercise = teachingGuide[selectedLessonNumber]?.exercises?.[exerciseIndex]
    if (!exercise) return

    setConsoleOpen(true)
    setPanelFocus('none')
    setRunning(true)

    try {
      const result = await executePythonInWorker(code)
      const actualOutput =
        result?.text ??
        (result?.error ? String(result.error) : '') ??
        ''

      const normalize = (value: string) =>
        value.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim()

      const passed =
        result?.success !== false &&
        result?.type !== 'error' &&
        normalize(actualOutput) === normalize(exercise.expected)

      setExerciseResults((current) => ({
        ...current,
        [`${selectedLessonNumber}-${exerciseIndex}`]: {
          status: passed ? 'correct' : 'incorrect',
          output: actualOutput,
          earned: passed ? exercise.points : 0,
        },
      }))

      setOutput([
        'HARBOR CONSOLE',
        '────────────────────────',
        '',
        'EXERCISE GRADE',
        passed ? '✓ CORRECT' : '✕ NOT QUITE',
        '',
        'EXPECTED',
        exercise.expected,
        '',
        'YOUR OUTPUT',
        actualOutput || 'No output.',
        '',
        'SCORE',
        `${passed ? exercise.points : 0} / ${exercise.points}`,
      ].join('\n'))
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)

      setExerciseResults((current) => ({
        ...current,
        [`${selectedLessonNumber}-${exerciseIndex}`]: {
          status: 'error',
          output: message,
          earned: 0,
        },
      }))

      setOutput([
        'HARBOR CONSOLE',
        '────────────────────────',
        '',
        'EXERCISE GRADE',
        '✕ EXECUTION ERROR',
        '',
        message,
      ].join('\n'))
    } finally {
      setRunning(false)
    }
  }

  const runCode = async () => {
    if (running) return

    setRunning(true)

    setOutput(
      [
        'HARBOR CONSOLE',
        '────────────────────────',
        '',
        'STATUS',
        'Starting Python...',
      ].join('\n')
    )

    try {
      const result = await executePythonInWorker(code)

      const actualOutput =
        result?.text ??
        (result?.error ? String(result.error) : '') ??
        ''

      if (result?.success === false || result?.type === 'error') {
        setOutput(
          [
            'HARBOR CONSOLE',
            '────────────────────────',
            '',
            'EXPECTED OUTPUT',
            selectedProblem.expectedOutput,
            '',
            'YOUR OUTPUT',
            actualOutput || 'Python execution failed.',
            '',
            'STATUS',
            'Execution error',
          ].join('\n')
        )
        return
      }

      setOutput(
        [
          'HARBOR CONSOLE',
          '────────────────────────',
          '',
          'EXPECTED OUTPUT',
          selectedProblem.expectedOutput,
          '',
          'YOUR OUTPUT',
          actualOutput || '(no output)',
          '',
          'STATUS',
          'Execution completed',
        ].join('\n')
      )
    } catch (error) {
      const message =
        error instanceof Error ? error.message : String(error)

      setOutput(
        [
          'HARBOR CONSOLE',
          '────────────────────────',
          '',
          'EXPECTED OUTPUT',
          selectedProblem.expectedOutput,
          '',
          'YOUR OUTPUT',
          message,
          '',
          'STATUS',
          'Execution error',
        ].join('\n')
      )
    } finally {
      setRunning(false)
    }
  }

  const submit = () => {
    if (!solvedIds.includes(selectedProblem.id)) {
      setSolvedIds((current) => [...current, selectedProblem.id])
    }
    setOutput(
      [
        'HARBOR CONSOLE',
        '────────────────────────',
        'Submission accepted locally.',
        '',
        'Visible tests   ✓',
        'Progress        +50 XP',
        'Next waypoint   unlocked',
      ].join('\n')
    )
  }

  const selectProblem = (problem: Problem) => {
    setLessonQuizChoice(null)
    setLessonPrediction(null)
    setSelected(problem)
    setSelectedLessonNumber(problem.id)
    setCode(problem.starterCode)
    setOutput(
      [
        'EXPECTED OUTPUT',
        problem.expectedOutput,
        '',
        'YOUR OUTPUT',
        'Press Shift + Enter to run your code.',
      ].join('\n')
    )
    setActiveTab('Learn')
  }

  // Open the shared Harbor Console with code supplied by the article.
  // Keeping this in one helper makes every contextual "open/load" action behave the same way.
  const openHarborConsoleWithCode = (nextCode: string) => {
    setCode(nextCode)
    setPanelFocus('none')
    setConsoleOpen(true)
  }

  useEffect(() => {
    const editor = editorRef.current
    if (!editor) return

    const handleNativeRunShortcut = (event: KeyboardEvent) => {
      if (event.key !== 'Enter' || !event.shiftKey) return

      event.preventDefault()
      event.stopPropagation()

      if (!running) {
        runCode()
      }
    }

    editor.addEventListener('keydown', handleNativeRunShortcut, true)

    return () => {
      editor.removeEventListener('keydown', handleNativeRunShortcut, true)
    }
  }, [running, selectedProblem.id, code])

  const tabItems = [
    ['Learn', '▣'],
    ['Examples', '◇'],
    ['Exercises', '✦'],
    ['Quiz', '⌁'],
    ['Reference', '≡'],
  ]

  return (
    <>
      <style>{`
        html,
        body {
          width: 100%;
          height: 100%;
          min-height: 0;
          margin: 0;
          padding: 0;
          overflow: hidden !important;
        }

        body > div,
        #__next {
          width: 100%;
          height: 100%;
          min-height: 0;
          overflow: hidden;
        }
      `}</style>

      <div
      style={{
        width: '100%',
        height: '100dvh',
        minHeight: 0,
        maxHeight: '100dvh',
        display: 'grid',
        gridTemplateRows: '68px auto minmax(0, 1fr)',
        overflow: 'hidden',
        background: bg,
        color: ink,
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
      }}
    >
      {/* DISTINCTIVE HARBOR HEADER */}
      <header
        style={{
          height: '68px',
          minHeight: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 18,
          padding: '0 24px',
          background: panel,
          borderBottom: `1px solid ${line}`,
          position: 'relative',
          zIndex: 20,
        }}
      >
        <Link
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textDecoration: 'none',
            color: ink,
            minWidth: 188,
          }}
        >
          <Image src="/logo.png" alt="HackersHarbor" width={36} height={36} />
          <span style={{ fontWeight: 750, letterSpacing: '-0.5px' }}>
            Hackers<span style={{ color: sea }}>Harbor</span>
          </span>
        </Link>

        <div
          style={{
            height: 30,
            width: 1,
            background: line,
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <span
            style={{
              fontSize: 12,
              letterSpacing: '1.6px',
              textTransform: 'uppercase',
              color: muted,
              fontWeight: 750,
            }}
          >
            The Learning Deck
          </span>
          <span style={{ fontSize: 15.6, fontWeight: 650 }}>
            Python • Practice Voyage
          </span>
        </div>

        <div style={{ flex: 1 }} />

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13.2,
            color: muted,
          }}
        >
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: '#29A36A',
              boxShadow: '0 0 0 4px rgba(41,163,106,.10)',
            }}
          />
          Learning progress {progress}%
        </div>

        <button
          type="button"
          onClick={() => setDarkMode((v) => !v)}
          aria-label="Toggle color theme"
          style={{
            width: 38,
            height: 38,
            borderRadius: 11,
            border: `1px solid ${line}`,
            background: panel2,
            color: ink,
            cursor: 'pointer',
            fontSize: 18,
          }}
        >
          {darkMode ? '☼' : '◐'}
        </button>

        <Link
          href="/dashboard"
          style={{
            textDecoration: 'none',
            color: '#fff',
            background: sea,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13.2,
            fontWeight: 750,
          }}
        >
          Dashboard
        </Link>
      </header>

      {/* LEARNING TOOLBAR */}
      <div
        style={{
          minHeight: 0,
          minWidth: 0,
          boxSizing: 'border-box',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '10px 24px',
          background: panel2,
          borderBottom: `1px solid ${line}`,
          overflowX: 'auto',
          overflowY: 'hidden',
        }}
      >
        {tabItems.map(([label, icon]) => (
          <button
            key={label}
            type="button"
            onClick={() => setActiveTab(label)}
            style={{
              border: 'none',
              background: activeTab === label ? seaSoft : 'transparent',
              color: activeTab === label ? sea : muted,
              padding: '8px 12px',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 13.2,
              fontWeight: activeTab === label ? 750 : 600,
              fontFamily: 'inherit',
            }}
          >
            <span style={{ marginRight: 6 }}>{icon}</span>
            {label}
          </button>
        ))}

        <div style={{ flex: 1 }} />

        <button
          type="button"
          onClick={() => {
            setActiveTab('Reference')
            requestAnimationFrame(() => {
              articleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
            })
          }}
          aria-label="Open quick reference"
          style={{
            border: `1px solid ${line}`,
            background: panel,
            color: ink,
            padding: '9px 14px',
            borderRadius: 9,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 800,
            fontFamily: 'inherit',
          }}
        >
          Open quick reference
        </button>
      </div>

      {showBackToTop && (
        <button
          type="button"
          aria-label="Back to top"
          onClick={() => {
            articleScrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          style={{
            position: 'fixed',
            top: consoleOpen ? 30 : 'auto',
            bottom: consoleOpen ? 'auto' : 64,
            right: consoleOpen ? `${consolePanelWidth + 18}px` : 18,
            minWidth: 176,
            height: 34,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1002,
            border: `1px solid ${darkMode ? '#2A4941' : '#203B32'}`,
            background: '#0C211C',
            color: '#C9E7DD',
            borderRadius: 9,
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 900,
            letterSpacing: '.02em',
            whiteSpace: 'nowrap',
            boxShadow: '0 7px 22px rgba(0,0,0,.18)',
            transition: 'right .38s cubic-bezier(.22,.8,.24,1), top .2s ease, opacity .2s ease',
          }}
        >
          ↑ Back To Top
        </button>
      )}

      {/* ONE HARBOR CONSOLE TOGGLE — the same button opens and closes the drawer */}
      <button
        type="button"
        aria-label={consoleOpen ? 'Hide Harbor Console' : 'Open Harbor Console'}
        onClick={() => {
          setConsoleOpen((open) => !open)
          setPanelFocus('none')
        }}
        style={{
          position: 'fixed',
          top: consoleOpen ? 78 : 'auto',
          bottom: consoleOpen ? 'auto' : 18,
          right: consoleOpen ? `${consolePanelWidth + 18}px` : 18,
          minWidth: 176,
          height: 36,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1002,
          border: `1px solid ${darkMode ? '#2A4941' : '#203B32'}`,
          background: '#0C211C',
          color: '#C9E7DD',
          borderRadius: 9,
          padding: '8px 12px',
          cursor: 'pointer',
          fontSize: 12,
          fontWeight: 900,
          letterSpacing: '.02em',
          whiteSpace: 'nowrap',
          boxShadow: '0 7px 22px rgba(0,0,0,.18)',
          transition: 'right .38s cubic-bezier(.22,.8,.24,1), top .2s ease',
        }}
      >
        {consoleOpen ? '← Hide Harbor Console' : 'Open Harbor Console →'}
      </button>

      {/* THREE-CHANNEL LEARNING DECK */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            `${curriculumNarrow ? 190 : curriculumWidth}px minmax(0, 1fr) ${consoleOpen ? `${consolePanelWidth}px` : '0px'}`,
          height: '100%',
          minHeight: 0,
          minWidth: 0,
          position: 'relative',
          overflow: 'hidden',
          boxSizing: 'border-box',
          transition: draggingPanel ? 'none' : 'grid-template-columns .38s cubic-bezier(.22,.8,.24,1)',
        }}
        ref={deckRef}
      >
        {/* LEFT: CURRICULUM */}
        <aside
          style={{
            background: panel,
            borderRight: `1px solid ${line}`,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
            position: 'relative',
            height: '100%',
            minHeight: 0,
            overflow: 'hidden',
            fontSize: `${12 * curriculumFontScale}px`,
            fontWeight: curriculumFontWeight,
            zoom: curriculumFontScale,
            transformOrigin: 'left top',
          }}
        >
          <div
            style={{
              padding: '18px 16px 15px',
              borderBottom: `1px solid ${line}`,
            }}
          >
            <div
              style={{
                fontSize: 9.6,
                fontWeight: 900,
                letterSpacing: 1.5,
                color: sea,
                marginBottom: 6,
              }}
            >
              PYTHON
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 5,
                marginBottom: 8,
              }}
            >
              <button
                type="button"
                title={curriculumNarrow ? 'Expand learning path' : 'Shrink learning path'}
                onClick={() => {
                  setPanelFocus('none')
                  setCurriculumNarrow((v) => !v)
                }}
                style={{
                  border: `1px solid ${line}`,
                  background: panel2,
                  color: muted,
                  borderRadius: '50%',
                  width: 24,
                  height: 22,
                  cursor: 'pointer',
                  fontSize: 14.4,
                  fontWeight: 800,
                }}
              >
                {curriculumNarrow ? '+' : '−'}
              </button>
              <button
                type="button"
                title={panelFocus === 'curriculum' ? 'Restore layout' : 'Maximize learning path'}
                onClick={() => {
                  setCurriculumNarrow(false)
                  setPanelFocus((v) => v === 'curriculum' ? 'none' : 'curriculum')
                }}
                style={{
                  border: `1px solid ${line}`,
                  background: panelFocus === 'curriculum' ? sea : panel2,
                  color: panelFocus === 'curriculum' ? '#fff' : muted,
                  borderRadius: 6,
                  width: 24,
                  height: 22,
                  cursor: 'pointer',
                  fontSize: 10.8,
                  fontWeight: 900,
                }}
              >
                {panelFocus === 'curriculum' ? '↙' : '□'}
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 18,
                    lineHeight: 1.15,
                    fontWeight: 850,
                    color: ink,
                  }}
                >
                  Learning Path
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 10.8,
                    lineHeight: 1.45,
                    color: muted,
                  }}
                >
                  Learn. Build. Practice. Prove. — Explore in any order.
                </div>
              </div>

              <div
                style={{
                  minWidth: 48,
                  padding: '7px 6px',
                  borderRadius: 8,
                  border: `1px solid ${line}`,
                  background: panel2,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    fontSize: 16.8,
                    lineHeight: 1,
                    fontWeight: 900,
                    color: ink,
                  }}
                >
                  {Math.min(solvedCount, curriculumLessons.length)}
                  <span style={{ color: muted, fontWeight: 600 }}>/{curriculumLessons.length}</span>
                </div>
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 7.8,
                    letterSpacing: .8,
                    fontWeight: 800,
                    color: muted,
                  }}
                >
                  LESSONS CLEARED
                </div>
              </div>
            </div>

            <div style={{ marginTop: 14 }}>
              <div
                style={{
                  height: 5,
                  borderRadius: 99,
                  background: darkMode ? '#172B31' : '#E6ECE8',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    width: `${progress}%`,
                    height: '100%',
                    borderRadius: 99,
                    background: sea,
                    transition: 'width .25s ease',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginTop: 6,
                  fontSize: 9,
                  color: muted,
                }}
              >
                <span>Overall progress</span>
                <strong style={{ color: sea }}>{progress}%</strong>
              </div>
            </div>
          </div>

          <div
            style={{
              flex: '1 1 auto',
              minHeight: 0,
              minWidth: 0,
              height: 'auto',
              overflowY: 'scroll',
              overflowX: 'hidden',
              overscrollBehaviorY: 'contain',
              overscrollBehaviorX: 'none',
              WebkitOverflowScrolling: 'touch',
              scrollbarGutter: 'stable both-edges',
              scrollbarWidth: 'thin',
              boxSizing: 'border-box',
              padding: '10px 10px 18px',
            }}
          >
            {(['BEGINNER', 'INTERMEDIATE', 'HARD'] as const).map((level) => {
              const lessons = curriculumLessons.filter(
                (lesson) => lesson.level === level,
              )

              const levelDescription =
                level === 'BEGINNER'
                  ? 'Build the mental model.'
                  : level === 'INTERMEDIATE'
                    ? 'Turn the fundamentals into reliable solutions.'
                    : 'Apply Python to larger and more demanding systems.'

              return (
                <section key={level} style={{ marginBottom: 16 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      justifyContent: 'space-between',
                      padding: '6px 6px 8px',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 9.6,
                          letterSpacing: 1.1,
                          fontWeight: 900,
                          color:
                            level === 'BEGINNER'
                              ? sea
                              : level === 'INTERMEDIATE'
                                ? '#B36A18'
                                : '#B83A3A',
                        }}
                      >
                        {level}
                      </div>
                      <div
                        style={{
                          marginTop: 4,
                          fontSize: 9,
                          color: muted,
                        }}
                      >
                        {levelDescription}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 8.4,
                        color: muted,
                        fontWeight: 800,
                      }}
                    >
                      {String(lessons[0].number).padStart(2, '0')} —{' '}
                      {String(lessons[lessons.length - 1].number).padStart(2, '0')}
                    </span>
                  </div>

                  <div
                    style={{
                      position: 'relative',
                      paddingLeft: 13,
                    }}
                  >
                    <div
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: 2,
                        top: 8,
                        bottom: 8,
                        width: 1,
                        background: line,
                      }}
                    />
                    {lessons.map((lesson, index) => {
                      const active = selectedLessonNumber === lesson.number
                      const linkedProblem = lesson.problemId
                        ? problems.find((problem) => problem.id === lesson.problemId)
                        : undefined
                      const solved = linkedProblem
                        ? solvedIds.includes(linkedProblem.id)
                        : false

                      return (
                        <button
                          key={lesson.number}
                          type="button"
                          onClick={() => {
                            setSelectedLessonNumber(lesson.number)
                            setActiveTab('Learn')

                            if (linkedProblem) {
                              selectProblem(linkedProblem)
                            } else {
                              const generated = makeLessonProblem(lesson)
                              setSelected(generated)
                              setCode(generated.starterCode)
                              setOutput(
                                [
                                  'EXPECTED OUTPUT',
                                  generated.expectedOutput,
                                  '',
                                  'YOUR OUTPUT',
                                  'Press Shift + Enter to run your lesson experiment.',
                                ].join('\n'),
                              )
                              setActiveTab('Learn')
                            }
                          }}
                          style={{
                            width: '100%',
                            display: 'block',
                            textAlign: 'left',
                            border: 'none',
                            background: active ? seaSoft : 'transparent',
                            borderRadius: 8,
                            marginBottom: index === lessons.length - 1 ? 0 : 4,
                            padding: '10px 9px 10px 8px',
                            cursor: 'pointer',
                            color: ink,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'flex-start',
                              gap: 9,
                            }}
                          >
                            <div
                              style={{
                                width: 28,
                                height: 28,
                                flex: '0 0 28px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 6,
                                border: `1px solid ${active ? sea : line}`,
                                background: active ? panel : panel2,
                                color: solved ? sea : muted,
                                fontSize: 9,
                                fontWeight: 900,
                              }}
                            >
                              {solved ? '✓' : String(lesson.number).padStart(2, '0')}
                            </div>

                            <div style={{ minWidth: 0, flex: 1 }}>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: `${12 * curriculumFontScale}px`,
                                    lineHeight: 1.25,
                                    fontWeight: Math.min(950, curriculumFontWeight + 110),
                                  }}
                                >
                                  {lesson.title}
                                </span>

                                {active && (
                                  <span
                                    style={{
                                      fontSize: 6.6,
                                      letterSpacing: .7,
                                      color: sea,
                                      fontWeight: 900,
                                    }}
                                  >
                                    CURRENT
                                  </span>
                                )}
                              </div>

                              <div
                                style={{
                                  marginTop: 4,
                                  fontSize: `${9 * curriculumFontScale}px`,
                                  lineHeight: 1.35,
                                  color: muted,
                                  fontWeight: curriculumFontScale >= 1 ? 550 : 450,
                                }}
                              >
                                {lesson.focus}
                              </div>

                              <div
                                style={{
                                  marginTop: 6,
                                  fontSize: 7,
                                  letterSpacing: .9,
                                  textTransform: 'uppercase',
                                  fontWeight: 850,
                                  color: active ? sea : muted,
                                }}
                              >
                                {lesson.problemId ? 'Guided concept' : 'Concept lesson'}
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 5,
                                  marginTop: 8,
                                  flexWrap: 'wrap',
                                }}
                              >
                                {['Learn', 'Playground', 'Exercise', 'Quiz'].map(
                                  (stage, stageIndex) => (
                                    <span
                                      key={stage}
                                      style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: 5,
                                      }}
                                    >
                                      <span
                                        style={{
                                          fontSize: `${7.8 * curriculumFontScale}px`,
                                          color: stageIndex === 0 ? ink : muted,
                                          fontWeight:
                                            stageIndex === 0
                                              ? Math.min(950, curriculumFontWeight + 60)
                                              : Math.max(500, curriculumFontWeight - 80),
                                        }}
                                      >
                                        {stage}
                                      </span>
                                      {stageIndex < 3 && (
                                        <span
                                          style={{
                                            color: line,
                                            fontSize: 7.2,
                                          }}
                                        >
                                          /
                                        </span>
                                      )}
                                    </span>
                                  ),
                                )}
                              </div>
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </section>
              )
            })}
          </div>
        </aside>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Drag to resize Learning Path"
          title="Drag to resize Learning Path"
          onPointerDown={(event) => beginPanelDrag('curriculum', event)}
          style={{
            position: 'absolute',
            zIndex: 100,
            top: 0,
            bottom: 0,
            left: `${curriculumNarrow ? 190 : curriculumWidth}px`,
            width: 10,
            transform: 'translateX(-50%)',
            cursor: 'col-resize',
            touchAction: 'none',
            background: 'transparent',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: 2,
              height: 48,
              transform: 'translate(-50%, -50%)',
              borderRadius: 99,
              background: draggingPanel === 'curriculum' ? sea : line,
              opacity: draggingPanel === 'curriculum' ? 1 : .65,
              pointerEvents: 'none',
            }}
          />
        </div>

        {/* CENTER: LEARNING CONTENT */}
        <main
          ref={articleScrollRef}
          style={{
            minWidth: 0,
            minHeight: 0,
            height: '100%',
            maxHeight: '100%',
            overflowY: 'scroll',
            overflowX: 'hidden',
            overscrollBehaviorY: 'contain',
            overscrollBehaviorX: 'none',
            WebkitOverflowScrolling: 'touch',
            scrollbarGutter: 'stable both-edges',
            scrollbarWidth: 'thin',
            boxSizing: 'border-box',
            background: bg,
          }}
        >
          <div style={{ maxWidth: 850, margin: '0 auto', padding: '30px 30px 110px' }}>
            {(() => {
              const currentLesson =
                curriculumLessons.find((lesson) => lesson.number === selectedLessonNumber) ??
                curriculumLessons[0]

              const levelLabel =
                currentLesson.level === 'BEGINNER'
                  ? 'Beginner'
                  : currentLesson.level === 'INTERMEDIATE'
                    ? 'Intermediate'
                    : 'Advanced'

              return (
                <>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      color: muted,
                      fontSize: 12,
                      fontWeight: 700,
                      letterSpacing: '.4px',
                      marginBottom: 15,
                    }}
                  >
                    <span>PYTHON</span>
                    <span>›</span>
                    <span>{getLessonTrack(currentLesson.number)}</span>
                    <span>›</span>
                    <span style={{ color: sea }}>
                      LESSON {String(currentLesson.number).padStart(2, '0')}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 20,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 10.8,
                          fontWeight: 900,
                          letterSpacing: '.14em',
                          color: sea,
                          textTransform: 'uppercase',
                          marginBottom: 7,
                        }}
                      >
                        {String(currentLesson.number).padStart(2, '0')} · {currentLesson.level}
                      </div>

                      <h1
                        style={{
                          margin: 0,
                          fontSize: 37.2,
                          lineHeight: 1.12,
                          letterSpacing: '-1.2px',
                        }}
                      >
                        {currentLesson.title}
                      </h1>

                      <p
                        style={{
                          margin: '12px 0 0',
                          color: muted,
                          fontSize: 15.6,
                          lineHeight: 1.75,
                          maxWidth: 700,
                        }}
                      >
                        {currentLesson.focus}
                      </p>
                    </div>

                    <span
                      style={{
                        flexShrink: 0,
                        border: `1px solid ${
                          currentLesson.level === 'BEGINNER'
                            ? '#16A34A'
                            : currentLesson.level === 'INTERMEDIATE'
                              ? '#B36A18'
                              : '#B83A3A'
                        }`,
                        color:
                          currentLesson.level === 'BEGINNER'
                            ? '#16A34A'
                            : currentLesson.level === 'INTERMEDIATE'
                              ? '#B36A18'
                              : '#B83A3A',
                        padding: '6px 9px',
                        borderRadius: 99,
                        fontSize: 10.8,
                        fontWeight: 800,
                      }}
                    >
                      {levelLabel}
                    </span>
                  </div>
                </>
              )
            })()}

            {activeTab === 'Learn' && (
              <>
                <section style={{ marginTop: 25, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                  <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase' }}>
                    WHY THIS EXISTS
                  </div>
                  <h2 style={{ margin: '8px 0 10px', fontSize: 22.8 }}>
                    {teachingGuide[selectedLessonNumber]?.question}
                  </h2>
                  <p style={{ margin: 0, color: muted, fontSize: 15.6, lineHeight: 1.85 }}>
                    {teachingGuide[selectedLessonNumber]?.why}
                  </p>
                  {teachingGuide[selectedLessonNumber]?.opening && (
                    <div style={{ marginTop: 14, padding: 15, borderRadius: 11, background: darkMode ? '#10231F' : '#F0F7F4', color: muted, fontSize: 15.6, lineHeight: 1.9 }}>
                      {teachingGuide[selectedLessonNumber]?.opening}
                    </div>
                  )}
                </section>

                <section style={{ marginTop: 14 }}>
                  <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase', marginBottom: 10 }}>
                    DEEP DIVE · READ IT LIKE A STORY
                  </div>
                  <div style={{ display: 'grid', gap: 10 }}>
                    {(teachingGuide[selectedLessonNumber]?.deepDive ?? []).map((chapter, i) => (
                      <section key={chapter.title} style={{ padding: '6px 0 24px', borderBottom: `1px solid ${line}` }}>
                        <h3 style={{ margin: '8px 0 13px', fontSize: 21.6, lineHeight: 1.35, color: ink }}>
                          {chapter.title}
                        </h3>
                        <div style={{ color: muted, fontSize: 14.4, lineHeight: 1.85 }}>
                          <p style={{ margin: '0 0 13px' }}>{chapter.body}</p>
                          {chapter.code && (
                            <>
                            <pre style={{ margin: '0 0 13px', padding: 14, borderRadius: 10, overflowX: 'auto', background: editor, color: '#D5EAE1', fontSize: 14.4, lineHeight: 1.75 }}>
                              {chapter.code}
                            </pre>
                            <button
                              type="button"
                              onClick={() => {
                                openHarborConsoleWithCode(chapter.code!)
                              }}
                              style={{
                                margin: '-3px 0 13px',
                                border: `1px solid ${line}`,
                                borderRadius: 8,
                                padding: '7px 10px',
                                background: panel2,
                                color: ink,
                                cursor: 'pointer',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              Open in Harbor Console →
                            </button>
                            </>
                          )}
                          {chapter.breakdown && (
                            <div style={{ display: 'grid', gap: 7, marginBottom: 13 }}>
                              {chapter.breakdown.map((part) => (
                                <div key={part.part} style={{ padding: '9px 11px', borderRadius: 9, background: darkMode ? '#0E2027' : '#F6F9F7' }}>
                                  <strong style={{ color: ink }}>{part.part}</strong>
                                  <span style={{ marginLeft: 7 }}>{part.meaning}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          {chapter.whatPythonDoes && (
                            <div style={{ padding: 12, borderRadius: 10, background: darkMode ? '#10231F' : '#F0F7F4', marginBottom: 10 }}>
                              <strong style={{ color: sea }}>WHAT PYTHON DOES</strong>
                              <div style={{ marginTop: 5 }}>{chapter.whatPythonDoes}</div>
                            </div>
                          )}
                          {chapter.tryIt && (
                            <div style={{ padding: 12, borderRadius: 10, border: `1px dashed ${line}` }}>
                              <strong style={{ color: ink }}>TRY IT:</strong> {chapter.tryIt}
                            </div>
                          )}
                        </div>
                      </section>
                    ))}
                  </div>
                </section>

                <section style={{ marginTop: 14, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                  <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase' }}>
                    WALK THROUGH IT
                  </div>
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {teachingGuide[selectedLessonNumber]?.steps.map((step, i) => (
                      <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ minWidth: 25, height: 25, borderRadius: 8, display: 'grid', placeItems: 'center', background: seaSoft, color: sea, fontSize: 12, fontWeight: 900 }}>
                          {i + 1}
                        </span>
                        <p style={{ margin: 0, color: muted, fontSize: 14.4, lineHeight: 1.75 }}>{step}</p>
                      </div>
                    ))}
                  </div>
                </section>

                <section style={{ marginTop: 14, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <strong style={{ fontSize: 14.4 }}>See the idea in code</strong>
                    <span style={{ color: muted, fontSize: 10.8 }}>READ BEFORE RUNNING</span>
                  </div>
                  <pre style={{ margin: 0, padding: 16, borderRadius: 11, background: editor, color: '#D5EAE1', overflow: 'auto', fontSize: 14.4, lineHeight: 1.75 }}>
                    {teachingGuide[selectedLessonNumber]?.code}
                  </pre>
                  <div style={{ marginTop: 13, padding: 13, borderRadius: 10, background: darkMode ? '#10231F' : '#F0F7F4' }}>
                    <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.1em' }}>WHAT PYTHON DOES</div>
                    <p style={{ margin: '7px 0 0', color: muted, fontSize: 14.4, lineHeight: 1.75 }}>
                      {teachingGuide[selectedLessonNumber]?.whatPythonDoes}
                    </p>
                  </div>
                </section>
              <section style={{ marginTop: 16, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  EXPERIMENT
                </div>
                <h3 style={{ margin: '8px 0 6px', fontSize: 19.2 }}>
                  See the execution order
                </h3>
                <p style={{ margin: 0, color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                  Run the code once. Predict the output order before running it again. Then change one thing at a time.
                  The goal is to observe cause and effect rather than copy an answer.
                </p>
                <pre style={{ marginTop: 14, padding: 14, borderRadius: 10, overflowX: 'auto', background: darkMode ? '#0B1110' : '#F5F7F6', fontSize: 14.4, lineHeight: 1.7 }}>
{`print("SYSTEM CHECK")
print(42)
print("42")`}
                </pre>
              </section>

              <section style={{ marginTop: 16, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  BREAK IT ON PURPOSE
                </div>
                <h3 style={{ margin: '8px 0 6px', fontSize: 19.2 }}>
                  What happens when Python cannot finish reading your instruction?
                </h3>
                <p style={{ margin: 0, color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                  Predict first. Then run this deliberately broken line and read the error instead of treating it as a punishment.
                </p>
                <pre style={{ marginTop: 14, padding: 14, borderRadius: 10, overflowX: 'auto', background: darkMode ? '#0B1110' : '#F5F7F6', fontSize: 14.4, lineHeight: 1.7 }}>
{`print("Harbor online)`}
                </pre>
                <p style={{ margin: '12px 0 0', color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                  The opening quotation mark starts a string, but no closing quotation mark ends it. Python reaches the end of the instruction while still looking for that closing mark.
                </p>
              </section>

              
              
<LessonPredictionPanel
                data={teachingGuide[selectedLessonNumber]?.prediction}
                choice={lessonPrediction}
                onChoose={(value) => setLessonPrediction(value)}
                darkMode={darkMode}
                panel={panel}
                line={line}
                muted={muted}
                sea={sea}
              />
              <section style={{ marginTop: 16, padding: 20, border: `1px solid ${line}`, borderRadius: 14, background: panel }}>
                <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.14em', textTransform: 'uppercase' }}>
                  WHY VARIABLES WILL MATTER
                </div>
                <h3 style={{ margin: '8px 0 6px', fontSize: 19.2 }}>A new problem is about to appear</h3>
                <p style={{ margin: 0, color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                  Imagine writing <strong>print("Aurora")</strong> twenty times. What if the vessel's name changes tomorrow?
                  You can write the value repeatedly, but repeating important data makes a program harder to change.
                  Lesson 02 solves that problem by giving values names.
                </p>
              </section>

              <div
                 id="learn-navigation-footer"
                 data-navigation-footer="true"
                style={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  marginTop: 34,
                  paddingTop: 22,
                           paddingBottom: 20,
                  borderTop: `1px solid ${line}`,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('Examples')
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 20px',
                    background: sea,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '.02em',
                    boxShadow: '0 6px 18px rgba(8, 111, 94, .18)',
                  }}
                >
                  Move To Examples →
                </button>
</div>

              </>
            )}

            {activeTab === 'Examples' && (
              <section style={{ marginTop: 25 }}>
                <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase' }}>
                  EXAMPLES · 20 WAYS TO SEE THE IDEA
                </div>
                <h2 style={{ margin: '8px 0 7px', fontSize: 24 }}>
                  Explore the concept through examples
                </h2>
                <p style={{ color: muted, fontSize: 14.4, lineHeight: 1.8, margin: 0, maxWidth: 760 }}>
                  Do not treat these as code to copy. Read the explanation, predict what Python will do,
                  then open any example in Harbor Console and change one thing.
                </p>

                <div style={{ display: 'grid', gap: 16, marginTop: 20 }}>
                  {(teachingGuide[selectedLessonNumber]?.examples ?? []).map((item, i) => (
                    <section
                      key={`${selectedLessonNumber}-example-${i}`}
                      style={{
                        padding: 20,
                        border: `1px solid ${line}`,
                        borderRadius: 14,
                        background: panel,
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
                        <span
                          style={{
                            minWidth: 27,
                            height: 27,
                            borderRadius: 8,
                            display: 'grid',
                            placeItems: 'center',
                            background: seaSoft,
                            color: sea,
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <h3 style={{ margin: 0, fontSize: 19.2, lineHeight: 1.35 }}>
                          {item.title}
                        </h3>
                      </div>

                      <p style={{ margin: '0 0 12px', color: muted, fontSize: 13.2, lineHeight: 1.75 }}>
                        {item.explanation}
                      </p>

                      <pre
                        style={{
                          margin: 0,
                          padding: 14,
                          borderRadius: 10,
                          overflowX: 'auto',
                          background: editor,
                          color: '#D5EAE1',
                          fontSize: 14.4,
                          lineHeight: 1.7,
                        }}
                      >
                        {item.code}
                      </pre>

                      {item.whatPythonDoes && (
                        <div style={{ marginTop: 11, padding: 11, borderRadius: 9, background: darkMode ? '#10231F' : '#F0F7F4' }}>
                          <strong style={{ color: sea }}>What Python does:</strong>
                          <span style={{ color: muted }}> {item.whatPythonDoes}</span>
                        </div>
                      )}

                      {item.tryIt && (
                        <div style={{ marginTop: 9, color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                          <strong style={{ color: ink }}>Try it:</strong> {item.tryIt}
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          setCode(item.code)
                          setConsoleOpen(true)
                          setPanelFocus('none')
                        }}
                        style={{
                          marginTop: 12,
                          border: `1px solid ${line}`,
                          borderRadius: 8,
                          padding: '8px 11px',
                          background: panel2,
                          color: ink,
                          cursor: 'pointer',
                          fontSize: 12,
                          fontWeight: 800,
                        }}
                      >
                        Open in Harbor Console →
                      </button>
                    </section>
                  ))}
                </div>

                <div
                 id="examples-navigation-footer"
                 data-navigation-footer="true"
                  style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginTop: 28,
                    paddingTop: 20,
                           paddingBottom: 20,
                    borderTop: `1px solid ${line}`,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('Exercises')
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 20px',
                    background: sea,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '.02em',
                    boxShadow: '0 6px 18px rgba(8, 111, 94, .18)',
                  }}
                  >
                    Move To Exercises →
                  </button>
                </div>
              </section>
            )}

            {activeTab === 'Playground' && (
              <section style={{ marginTop: 25 }}>
                <h2 style={{ fontSize: 21.6, marginBottom: 7 }}>Playground · Predict → Run → Change → Explain</h2>
                <p style={{ color: muted, fontSize: 14.4, lineHeight: 1.75 }}>
                  These are experiments, not demonstrations to copy. Read the goal, predict what Python will do,
                  run the code in Harbor Console, change exactly one thing, and explain what changed.
                </p>
                <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                  {(teachingGuide[selectedLessonNumber]?.playgrounds ?? []).map((item, i) => (
                    <section key={item.title} style={{ padding: '6px 0 24px', borderBottom: `1px solid ${line}` }}>
                      <h3 style={{ margin: '8px 0 13px', fontSize: 19.2, lineHeight: 1.4, color: ink }}>
                        {item.title}
                      </h3>
                      <div style={{ color: muted, fontSize: 13.2, lineHeight: 1.75 }}>
                        <p style={{ margin: '0 0 10px' }}><strong style={{ color: ink }}>Goal:</strong> {item.goal}</p>
                        <pre style={{ margin: 0, padding: 13, borderRadius: 9, overflowX: 'auto', background: editor, color: '#D5EAE1', fontSize: 14.4 }}>{item.code}</pre>
                        <div style={{ marginTop: 10 }}><strong style={{ color: ink }}>Predict:</strong> {item.predict}</div>
                        <div style={{ marginTop: 7 }}><strong style={{ color: ink }}>Change:</strong> {item.change}</div>
                        <div style={{ marginTop: 7, padding: 10, borderRadius: 9, background: darkMode ? '#10231F' : '#F0F7F4' }}>
                          <strong style={{ color: sea }}>Notice:</strong> {item.notice}
                        </div>
                        <button
                          type="button"
                          onClick={() => openHarborConsoleWithCode(item.code)}
                          style={{ marginTop: 11, border: `1px solid ${line}`, borderRadius: 8, padding: '7px 10px', background: panel2, color: ink, cursor: 'pointer', fontSize: 12, fontWeight: 800 }}
                        >
                          Load into Harbor Console
                        </button>
                      </div>
                    </section>
                  ))}
                </div>
              </section>
            )}

            {activeTab === 'Exercises' && (
              <section style={{ marginTop: 25 }}>
                <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase' }}>
                  EXERCISES · 20 CHALLENGES
                </div>
                <h2 style={{ fontSize: 24, margin: '8px 0 7px' }}>Your turn · Write, run, grade</h2>
                <p style={{ color: muted, fontSize: 14.4, lineHeight: 1.8, margin: 0, maxWidth: 780 }}>
                  Each exercise is worth 5 points. Open it in Harbor Console, write your own solution,
                  run it, then press <strong>Grade My Code</strong>. Grading checks the actual Python output,
                  so equivalent solutions can pass.
                </p>

                {(() => {
                  const lessonExercises = teachingGuide[selectedLessonNumber]?.exercises ?? []
                  const totalPoints = lessonExercises.reduce((sum, item) => sum + item.points, 0)
                  const earnedPoints = lessonExercises.reduce(
                    (sum, item, index) =>
                      sum + (exerciseResults[`${selectedLessonNumber}-${index}`]?.earned ?? 0),
                    0
                  )
                  const gradedCount = lessonExercises.filter(
                    (_, index) => Boolean(exerciseResults[`${selectedLessonNumber}-${index}`])
                  ).length

                  return (
                    <>
                      <div
                        style={{
                          marginTop: 18,
                          padding: 16,
                          border: `1px solid ${line}`,
                          borderRadius: 13,
                          background: panel,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 16,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                            FIRST CONTACT SCORE
                          </div>
                          <div style={{ marginTop: 5, fontSize: 21.6, fontWeight: 900 }}>
                            {earnedPoints} / {totalPoints}
                          </div>
                        </div>
                        <div style={{ color: muted, fontSize: 13.2 }}>
                          {gradedCount} / {lessonExercises.length} exercises graded
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: 16, marginTop: 18 }}>
                        {lessonExercises.map((item, i) => {
                          const result = exerciseResults[`${selectedLessonNumber}-${i}`]

                          return (
                            <section
                              key={`${selectedLessonNumber}-exercise-${i}`}
                              style={{
                                padding: 20,
                                border: `1px solid ${
                                  result?.status === 'correct'
                                    ? '#55A982'
                                    : result?.status === 'incorrect' || result?.status === 'error'
                                      ? '#C94A42'
                                      : line
                                }`,
                                borderRadius: 14,
                                background: panel,
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                <span
                                  style={{
                                    minWidth: 29,
                                    height: 29,
                                    borderRadius: 8,
                                    display: 'grid',
                                    placeItems: 'center',
                                    background: seaSoft,
                                    color: sea,
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  {String(i + 1).padStart(2, '0')}
                                </span>
                                <h3 style={{ margin: 0, fontSize: 19.2, lineHeight: 1.4, color: ink }}>
                                  {item.title}
                                </h3>
                                <span style={{ marginLeft: 'auto', color: muted, fontSize: 10.8, fontWeight: 900 }}>
                                  {item.points} PTS
                                </span>
                              </div>

                              <p style={{ margin: '13px 0 10px', color: ink, fontSize: 14.4, fontWeight: 750, lineHeight: 1.75 }}>
                                {item.prompt}
                              </p>

                              <div style={{ padding: 11, borderRadius: 9, background: darkMode ? '#10231F' : '#F4F8F6', color: muted, fontSize: 13.2, lineHeight: 1.7 }}>
                                <strong style={{ color: sea }}>Hint:</strong> {item.hint}
                              </div>

                              <div style={{ marginTop: 12, color: muted, fontSize: 12, lineHeight: 1.6 }}>
                                Expected output stays hidden until you grade your solution.
                              </div>

                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 13 }}>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setCode(item.starterCode)
                                    setConsoleOpen(true)
                                    setPanelFocus('none')
                                  }}
                                  style={{
                                    border: `1px solid ${line}`,
                                    borderRadius: 8,
                                    padding: '8px 11px',
                                    background: panel2,
                                    color: ink,
                                    cursor: 'pointer',
                                    fontSize: 12,
                                    fontWeight: 800,
                                  }}
                                >
                                  Open in Harbor Console →
                                </button>

                                <button
                                  type="button"
                                  onClick={() => gradeExercise(i)}
                                  disabled={running}
                                  style={{
                                    border: 'none',
                                    borderRadius: 8,
                                    padding: '8px 12px',
                                    background: running ? '#456B60' : sea,
                                    color: '#fff',
                                    cursor: running ? 'wait' : 'pointer',
                                    fontSize: 12,
                                    fontWeight: 900,
                                  }}
                                >
                                  {running ? 'Grading…' : 'Grade My Code ✓'}
                                </button>
                              </div>

                              {result && (
                                <div
                                  style={{
                                    marginTop: 13,
                                    padding: 12,
                                    borderRadius: 10,
                                    background: result.status === 'correct'
                                      ? (darkMode ? '#123126' : '#ECF8F1')
                                      : (darkMode ? '#321F1E' : '#FFF1EF'),
                                    color: result.status === 'correct'
                                      ? (darkMode ? '#A8DFC2' : '#226C4B')
                                      : (darkMode ? '#F0B7B2' : '#8E302B'),
                                    fontSize: 13.2,
                                    lineHeight: 1.7,
                                  }}
                                >
                                  <strong>
                                    {result.status === 'correct'
                                      ? `✓ Correct · ${result.earned}/${item.points} points`
                                      : result.status === 'error'
                                        ? '✕ Execution error · 0 points'
                                        : `✕ Not quite · ${result.earned}/${item.points} points`}
                                  </strong>
                                  <div style={{ marginTop: 5 }}>
                                    {result.status === 'correct'
                                      ? item.correctExplanation
                                      : result.status === 'error'
                                        ? item.incorrectExplanation
                                        : item.incorrectExplanation}
                                  </div>
                                  <div style={{ marginTop: 7 }}>
                                    <strong>Your latest output:</strong>{' '}
                                    <code>{result.output || 'No output.'}</code>
                                  </div>
                                </div>
                              )}
                            </section>
                          )
                        })}
                      </div>

                      <div
                 id="exercises-navigation-footer"
                 data-navigation-footer="true"
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          marginTop: 30,
                          paddingTop: 20,
                           paddingBottom: 20,
                          borderTop: `1px solid ${line}`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('Quiz')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 20px',
                    background: sea,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '.02em',
                    boxShadow: '0 6px 18px rgba(8, 111, 94, .18)',
                  }}
                        >
                          Move To Quizes →
                        </button>
                      </div>
                    </>
                  )
                })()}
              </section>
            )}

            {activeTab === 'Quiz' && (
              <section style={{ marginTop: 25 }}>
                {(() => {
                  const lessonQuizzes = teachingGuide[selectedLessonNumber]?.quizzes ?? []
                  const totalPoints = lessonQuizzes.length * 5
                  const earnedPoints = lessonQuizzes.reduce(
                    (sum, _, index) =>
                      sum + (quizResults[`${selectedLessonNumber}-${index}`]?.earned ?? 0),
                    0
                  )
                  const gradedCount = lessonQuizzes.filter(
                    (_, index) => Boolean(quizResults[`${selectedLessonNumber}-${index}`])
                  ).length

                  return (
                    <>
                      <div style={{ fontSize: 10.8, fontWeight: 900, letterSpacing: '.14em', color: sea, textTransform: 'uppercase' }}>
                        QUIZ · GRADED CHECKPOINT
                      </div>
                      <h2 style={{ fontSize: 24, margin: '8px 0 7px' }}>
                        Check your understanding
                      </h2>
                      <p style={{ color: muted, fontSize: 14.4, lineHeight: 1.75, margin: 0, maxWidth: 780 }}>
                        Choose an answer and submit it. Every question is worth 5 points.
                        You will immediately see an explanation for both correct and incorrect answers.
                        Nothing is locked if you make a mistake.
                      </p>

                      <div
                        style={{
                          marginTop: 18,
                          padding: 16,
                          border: `1px solid ${line}`,
                          borderRadius: 13,
                          background: panel,
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          gap: 16,
                          flexWrap: 'wrap',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 10.8, fontWeight: 900, color: sea, letterSpacing: '.12em', textTransform: 'uppercase' }}>
                            FIRST CONTACT QUIZ SCORE
                          </div>
                          <div style={{ marginTop: 5, fontSize: 21.6, fontWeight: 900 }}>
                            {earnedPoints} / {totalPoints}
                          </div>
                        </div>
                        <div style={{ color: muted, fontSize: 13.2 }}>
                          {gradedCount} / {lessonQuizzes.length} questions graded
                        </div>
                      </div>

                      <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
                        {lessonQuizzes.map((item, quizIndex) => (
                          <QuizCard
                            key={`${selectedLessonNumber}-${quizIndex}`}
                            number={quizIndex + 1}
                            data={item}
                            result={quizResults[`${selectedLessonNumber}-${quizIndex}`]}
                            onGrade={(choice) => {
                              const correct = choice === item.correct
                              setQuizResults((current) => ({
                                ...current,
                                [`${selectedLessonNumber}-${quizIndex}`]: {
                                  selected: choice,
                                  correct,
                                  earned: correct ? 5 : 0,
                                },
                              }))
                            }}
                            darkMode={darkMode}
                            panel={panel}
                            panel2={panel2}
                            line={line}
                            ink={ink}
                            muted={muted}
                            sea={sea}
                            seaSoft={seaSoft}
                          />
                        ))}
                      </div>

                      <div
                 id="quiz-navigation-footer"
                 data-navigation-footer="true"
                        style={{
                          display: 'flex',
                          justifyContent: 'flex-start',
                          marginTop: 30,
                          paddingTop: 20,
                           paddingBottom: 20,
                          borderTop: `1px solid ${line}`,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('Reference')
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          }}
                          style={{
                    border: 'none',
                    borderRadius: 10,
                    padding: '13px 20px',
                    background: sea,
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '.02em',
                    boxShadow: '0 6px 18px rgba(8, 111, 94, .18)',
                  }}
                        >
                          Move To References →
                        </button>
                      </div>
                    </>
                  )
                })()}
              </section>
            )}

            {activeTab === 'Reference' && (
              <section style={{ marginTop: 25, paddingBottom: 50 }}>
                <div
                  style={{
                    maxWidth: 900,
                    margin: '0 auto',
                  }}
                >
                  <div
                    style={{
                      fontSize: 10.8,
                      letterSpacing: 1.6,
                      fontWeight: 900,
                      color: sea,
                      textTransform: 'uppercase',
                      marginBottom: 10,
                    }}
                  >
                    FIRST CONTACT · QUICK REFERENCE
                  </div>

                  <h2
                    style={{
                      margin: 0,
                      fontSize: 36,
                      lineHeight: 1.12,
                      letterSpacing: '-.03em',
                    }}
                  >
                    Python Foundations Reference
                  </h2>

                  <p
                    style={{
                      margin: '12px 0 26px',
                      maxWidth: 760,
                      color: muted,
                      fontSize: 15.6,
                      lineHeight: 1.75,
                    }}
                  >
                    A compact reference for the ideas you just explored in
                    First Contact. Use it to refresh a concept, check a
                    definition, or jump back into the lesson without leaving
                    the learning path.
                  </p>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                      gap: 12,
                    }}
                  >
                    {[
                      {
                        title: 'Instructions',
                        text: 'Python programs are made from precise instructions that tell the computer what action to perform.',
                        example: 'print("Hello, Harbor")',
                      },
                      {
                        title: 'Syntax',
                        text: 'Syntax is the shape and structure Python expects before it can understand an instruction.',
                        example: 'print("Harbor online")',
                      },
                      {
                        title: 'Values',
                        text: 'Values are the pieces of information Python works with, such as numbers, text, and Boolean values.',
                        example: '42 · "Harbor" · True',
                      },
                      {
                        title: 'Expressions',
                        text: 'An expression is something Python can evaluate to produce a value.',
                        example: '10 + 5  →  15',
                      },
                      {
                        title: 'Execution',
                        text: 'When Python runs a program, it evaluates instructions and produces results step by step.',
                        example: 'instruction → evaluation → result',
                      },
                      {
                        title: 'Errors',
                        text: 'Errors are signals that Python could not interpret or execute an instruction as written.',
                        example: 'read the error → find the line → fix the cause',
                      },
                      {
                        title: 'Prediction',
                        text: 'Predicting the output before running code helps you build a mental model of Python execution.',
                        example: 'What will this print?',
                      },
                      {
                        title: 'Reading Code',
                        text: 'Before changing code, identify what each part is doing: the action, the values, and the expected result.',
                        example: 'print(10 + 5)',
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        style={{
                          padding: 18,
                          background: panel,
                          border: `1px solid ${line}`,
                          borderRadius: 12,
                          minHeight: 132,
                          boxSizing: 'border-box',
                        }}
                      >
                        <div
                          style={{
                            fontSize: 16.8,
                            fontWeight: 900,
                            marginBottom: 8,
                          }}
                        >
                          {item.title}
                        </div>

                        <div
                          style={{
                            color: muted,
                            fontSize: 13.2,
                            lineHeight: 1.65,
                            marginBottom: 12,
                          }}
                        >
                          {item.text}
                        </div>

                        <code
                          style={{
                            display: 'block',
                            padding: '8px 10px',
                            borderRadius: 8,
                            background: darkMode ? '#0C211C' : '#F1F7F4',
                            color: darkMode ? '#C9E7DD' : ink,
                            fontSize: 12,
                            fontWeight: 700,
                            overflowX: 'auto',
                          }}
                        >
                          {item.example}
                        </code>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      marginTop: 22,
                      padding: 17,
                      borderRadius: 12,
                      background: darkMode ? '#102A25' : '#EAF6F1',
                      border: `1px solid ${darkMode ? '#1B5146' : '#C9E8DC'}`,
                      color: darkMode ? '#B9D9CF' : '#27584B',
                      fontSize: 13.2,
                      lineHeight: 1.7,
                    }}
                  >
                    <strong>Remember:</strong> the reference is here to
                    support exploration, not replace it. When something feels
                    unclear, return to the lesson, open the Harbor Console,
                    change the code, and see what Python actually does.
                  </div>
                </div>
              </section>
            )}

          </div>
        </main>

        {panelFocus === 'none' && consoleOpen && (
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Drag to resize Harbor Console"
            title="Drag to resize Harbor Console"
            onPointerDown={(event) => beginPanelDrag('console', event)}
            style={{
              position: 'absolute',
              zIndex: 100,
              top: 0,
              bottom: 0,
              right: `${consolePanelWidth}px`,
              width: 9,
              marginRight: -4.5,
              cursor: 'col-resize',
              touchAction: 'none',
              background: 'transparent',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 2,
                height: 42,
                transform: 'translate(-50%, -50%)',
                borderRadius: 99,
                background: draggingPanel === 'console' ? sea : line,
                opacity: draggingPanel === 'console' ? 1 : .65,
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        {/* RIGHT: HARBOR CONSOLE */}
        <section
          style={{
            gridColumn: 3,
            position: 'relative',
            top: 'auto',
            alignSelf: 'stretch',
            width: '100%',
            minWidth: 0,
            maxWidth: '100%',
            height: '100%',
            minHeight: 0,
            maxHeight: '100%',
            boxSizing: 'border-box',
            zIndex: 30,
            zoom: consoleFontScale,
            fontWeight: consoleFontWeight,
            transformOrigin: 'right center',
            display: 'flex',
            flexDirection: 'column',
            background: editor,
            color: '#DCECE6',
            borderLeft: `1px solid ${darkMode ? '#1B3036' : '#203B32'}`,
            borderTop: `1px solid ${darkMode ? '#1B3036' : '#203B32'}`,
            borderRadius: '12px 0 0 0',
            transform: consoleOpen ? 'translate3d(0, 0, 0)' : 'translate3d(105%, 0, 0)',
            transition: 'transform .38s cubic-bezier(.22,.8,.24,1)',
            willChange: 'transform',
            boxShadow: consoleOpen ? '-18px 0 45px rgba(0,0,0,.22)' : 'none',
            overflow: 'hidden',
            pointerEvents: consoleOpen ? 'auto' : 'none',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 14px',
              borderBottom: '1px solid #203A35',
              background: '#0C211C',
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 10.8,
                  letterSpacing: 1.4,
                  color: '#78A99B',
                  fontWeight: 800,
                }}
              >
                HARBOR CONSOLE
              </div>
              <div style={{ fontSize: 13.2, fontWeight: 700, marginTop: 3 }}>
                Python playground
              </div>
            </div>

            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <button
                type="button"
                title={consoleNarrow ? 'Expand console' : 'Shrink console'}
                onClick={() => {
                  setPanelFocus('none')
                  setConsoleNarrow((v) => !v)
                }}
                style={{
                  border: '1px solid #2A4941',
                  background: '#102A24',
                  color: '#A9C8BE',
                  borderRadius: 6,
                  width: 24,
                  height: 22,
                  cursor: 'pointer',
                  fontSize: 14.4,
                  fontWeight: 800,
                }}
              >
                {consoleNarrow ? '+' : '−'}
              </button>

              <button
                type="button"
                onClick={() => setCode(selectedProblem.starterCode)}
                style={{
                  border: '1px solid #2A4941',
                  background: '#102A24',
                  color: '#A9C8BE',
                  borderRadius: 7,
                  padding: '6px 9px',
                  cursor: 'pointer',
                  fontSize: 10.8,
                }}
              >
                Reset
              </button>
              <button
                type="button"
                onClick={runCode}
                disabled={running}
                style={{
                  border: 'none',
                  background: running ? '#456B60' : orange,
                  color: '#fff',
                  borderRadius: 7,
                  padding: '6px 11px',
                  cursor: running ? 'wait' : 'pointer',
                  fontSize: 10.8,
                  fontWeight: 800,
                }}
              >
                {running ? 'Running…' : 'Run ▶'}
              </button>
              <span
                style={{
                  color: '#7FA69B',
                  fontSize: 9.6,
                  fontWeight: 800,
                  fontFamily: "'SFMono-Regular', Consolas, monospace",
                  whiteSpace: 'nowrap',
                  alignSelf: 'center',
                }}
              >
                Shift + Enter
              </span>
              <button
                type="button"
                onClick={submit}
                style={{
                  border: 'none',
                  background: sea,
                  color: '#fff',
                  borderRadius: 7,
                  padding: '6px 11px',
                  cursor: 'pointer',
                  fontSize: 10.8,
                  fontWeight: 800,
                }}
              >
                Submit
              </button>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              padding: '8px 14px',
              borderBottom: '1px solid #1C3430',
              color: '#7FA69B',
              fontSize: 10.8,
            }}
          >
            <span style={{ color: '#76C6A5' }}>●</span>
            main.py
            <span style={{ marginLeft: 'auto' }}>Python 3</span>
          </div>

          <textarea
            ref={editorRef}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            aria-label="Python code editor"
            style={{
              flex: 1,
              minHeight: 0,
              width: '100%',
              boxSizing: 'border-box',
              resize: 'none',
              outline: 'none',
              border: 'none',
              background: '#071411',
              color: '#D6E9E2',
              padding: '18px',
              fontFamily: "'SFMono-Regular', Consolas, monospace",
              fontSize: 15.6,
              lineHeight: 1.75,
            }}
          />

          <div
            style={{
              borderTop: '1px solid #203A35',
              background: '#091A16',
              minHeight: 175,
              padding: '12px 14px',
              boxSizing: 'border-box',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                color: '#789A90',
                fontSize: 10.8,
                fontWeight: 800,
                letterSpacing: 1,
                marginBottom: 8,
              }}
            >
              <span>OUTPUT</span>
              <span>{isSolved ? 'WAYPOINT CLEARED ✓' : 'READY'}</span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  color: '#789A90',
                  fontSize: 9.6,
                  fontWeight: 800,
                  letterSpacing: 1,
                }}
              >
                YOUR OUTPUT
              </span>

              <span
                style={{
                  color: '#79AFA0',
                  fontSize: 9.6,
                  fontWeight: 800,
                  fontFamily: "'SFMono-Regular', Consolas, monospace",
                  whiteSpace: 'nowrap',
                }}
              >
                SHIFT + ENTER TO RUN
              </span>
            </div>

            <pre
              style={{
                margin: 0,
                color: '#B9D6CC',
                whiteSpace: 'pre-wrap',
                fontFamily: "'SFMono-Regular', Consolas, monospace",
                fontSize: 12,
                lineHeight: 1.6,
              }}
            >
              {output || 'Press Shift + Enter to run your code.'}
            </pre>
          </div>
        </section>
      </div>
      </div>
    </>
  )
}
