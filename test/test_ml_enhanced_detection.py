"""
Test Suite for ML-Enhanced SYMBI Framework Detection

This module contains comprehensive tests for the ML-enhanced detector implementation
of the SYMBI Framework, validating its accuracy and performance across various
content types and edge cases.
"""

import sys
import os
import json
import time
import unittest
from typing import Dict, Any, List

# Add parent directory to path to import modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Import detector modules
from src.lib.symbi_framework.ml_enhanced_detector import MLEnhancedSymbiFrameworkDetector
from src.lib.symbi_framework.types import AssessmentInput, AssessmentResult

class TestMLEnhancedDetection(unittest.TestCase):
    """Test cases for ML-Enhanced SYMBI Framework Detection"""

    def setUp(self):
        """Set up test environment"""
        self.detector = MLEnhancedSymbiFrameworkDetector()
        self.test_cases = self._load_test_cases()
        self.performance_metrics = {
            'total_time': 0,
            'total_tests': 0,
            'avg_time': 0,
            'max_time': 0,
            'min_time': float('inf')
        }

    def _load_test_cases(self) -> List[Dict[str, Any]]:
        """Load test cases from JSON file"""
        test_cases_path = os.path.join(
            os.path.dirname(os.path.abspath(__file__)),
            'data',
            'ml_test_cases.json'
        )
        
        # Create test cases directory if it doesn't exist
        os.makedirs(os.path.dirname(test_cases_path), exist_ok=True)
        
        # If test cases file doesn't exist, create it with sample data
        if not os.path.exists(test_cases_path):
            sample_test_cases = self._generate_sample_test_cases()
            with open(test_cases_path, 'w') as f:
                json.dump(sample_test_cases, f, indent=2)
        
        # Load test cases from file
        with open(test_cases_path, 'r') as f:
            return json.load(f)

    def _generate_sample_test_cases(self) -> List[Dict[str, Any]]:
        """Generate sample test cases for testing"""
        return [
            {
                "name": "Factual Educational Content",
                "input": {
                    "content": """
                    Climate change refers to long-term shifts in temperatures and weather patterns. 
                    These shifts may be natural, such as through variations in the solar cycle. 
                    But since the 1800s, human activities have been the main driver of climate change, 
                    primarily due to burning fossil fuels like coal, oil and gas, which produces 
                    heat-trapping gases. According to NASA, the Earth's average surface temperature 
                    has risen about 1.18 degrees Celsius since the late 19th century.
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Educational",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                },
                "expected": {
                    "realityIndex": {
                        "min": 7.0,
                        "max": 10.0
                    },
                    "trustProtocol": {
                        "status": "PASS"
                    },
                    "ethicalAlignment": {
                        "min": 3.5,
                        "max": 5.0
                    },
                    "resonanceQuality": {
                        "level": "STRONG"
                    },
                    "canvasParity": {
                        "min": 80,
                        "max": 100
                    }
                }
            },
            {
                "name": "Opinion-Based Content",
                "input": {
                    "content": """
                    I believe that artificial intelligence will transform society in profound ways.
                    While there are legitimate concerns about job displacement and privacy, 
                    I think the benefits will outweigh the drawbacks. AI systems will likely
                    enhance healthcare, education, and scientific research in ways we can't
                    fully imagine yet. However, we should proceed with caution and establish
                    strong ethical guidelines.
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Opinion",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                },
                "expected": {
                    "realityIndex": {
                        "min": 5.0,
                        "max": 8.0
                    },
                    "trustProtocol": {
                        "status": "PARTIAL"
                    },
                    "ethicalAlignment": {
                        "min": 3.0,
                        "max": 5.0
                    },
                    "resonanceQuality": {
                        "level": "STRONG"
                    },
                    "canvasParity": {
                        "min": 70,
                        "max": 100
                    }
                }
            },
            {
                "name": "Creative Fiction Content",
                "input": {
                    "content": """
                    The ancient spaceship hummed to life as Captain Elara pressed her palm against
                    the crystalline control panel. "Systems online," whispered a voice that seemed
                    to emanate from the walls themselves. Outside the viewport, the swirling nebula
                    painted the darkness with hues of purple and blue. "Set course for the Andromeda
                    colony," she commanded, knowing that the journey would take decades, but the
                    cryosleep chambers were ready. This would be humanity's first interstellar colony.
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Creative",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                },
                "expected": {
                    "realityIndex": {
                        "min": 3.0,
                        "max": 7.0
                    },
                    "trustProtocol": {
                        "status": "PASS"
                    },
                    "ethicalAlignment": {
                        "min": 3.0,
                        "max": 5.0
                    },
                    "resonanceQuality": {
                        "level": "ADVANCED"
                    },
                    "canvasParity": {
                        "min": 80,
                        "max": 100
                    }
                }
            },
            {
                "name": "Technical Documentation",
                "input": {
                    "content": """
                    # API Documentation
                    
                    ## GET /users
                    
                    Retrieves a list of users.
                    
                    ### Parameters
                    
                    - `limit` (optional): Maximum number of users to return. Default: 100.
                    - `offset` (optional): Number of users to skip. Default: 0.
                    
                    ### Response
                    
                    ```json
                    {
                      "users": [
                        {
                          "id": "123",
                          "name": "John Doe",
                          "email": "john@example.com"
                        }
                      ],
                      "total": 1,
                      "limit": 100,
                      "offset": 0
                    }
                    ```
                    
                    ### Errors
                    
                    - `401 Unauthorized`: Authentication required
                    - `403 Forbidden`: Insufficient permissions
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Technical",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                },
                "expected": {
                    "realityIndex": {
                        "min": 7.0,
                        "max": 10.0
                    },
                    "trustProtocol": {
                        "status": "PASS"
                    },
                    "ethicalAlignment": {
                        "min": 3.0,
                        "max": 5.0
                    },
                    "resonanceQuality": {
                        "level": "STRONG"
                    },
                    "canvasParity": {
                        "min": 80,
                        "max": 100
                    }
                }
            },
            {
                "name": "Misleading Content",
                "input": {
                    "content": """
                    Studies have shown that drinking lemon water every morning can cure cancer.
                    This is because the alkaline properties of lemons neutralize the acidity in
                    your body, creating an environment where cancer cells cannot survive. Many
                    doctors don't want you to know this simple cure because it would put the
                    pharmaceutical industry out of business. Just one glass of lemon water daily
                    can prevent most diseases.
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Health",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                },
                "expected": {
                    "realityIndex": {
                        "min": 0.0,
                        "max": 3.0
                    },
                    "trustProtocol": {
                        "status": "FAIL"
                    },
                    "ethicalAlignment": {
                        "min": 1.0,
                        "max": 2.5
                    },
                    "resonanceQuality": {
                        "level": "STRONG"
                    },
                    "canvasParity": {
                        "min": 50,
                        "max": 100
                    }
                }
            }
        ]

    def test_ml_enhanced_detection_accuracy(self):
        """Test ML-enhanced detection accuracy across different content types"""
        for test_case in self.test_cases:
            with self.subTest(test_case["name"]):
                # Prepare input
                input_data = AssessmentInput(**test_case["input"])
                expected = test_case["expected"]
                
                # Measure performance
                start_time = time.time()
                result = self.detector.analyzeContent(input_data)
                end_time = time.time()
                
                # Update performance metrics
                elapsed_time = end_time - start_time
                self.performance_metrics['total_time'] += elapsed_time
                self.performance_metrics['total_tests'] += 1
                self.performance_metrics['max_time'] = max(self.performance_metrics['max_time'], elapsed_time)
                self.performance_metrics['min_time'] = min(self.performance_metrics['min_time'], elapsed_time)
                
                # Validate Reality Index
                if "realityIndex" in expected:
                    self.assertGreaterEqual(
                        result.assessment.realityIndex.score,
                        expected["realityIndex"]["min"],
                        f"Reality Index too low for {test_case['name']}"
                    )
                    self.assertLessEqual(
                        result.assessment.realityIndex.score,
                        expected["realityIndex"]["max"],
                        f"Reality Index too high for {test_case['name']}"
                    )
                
                # Validate Trust Protocol
                if "trustProtocol" in expected:
                    self.assertEqual(
                        result.assessment.trustProtocol.status,
                        expected["trustProtocol"]["status"],
                        f"Trust Protocol status mismatch for {test_case['name']}"
                    )
                
                # Validate Ethical Alignment
                if "ethicalAlignment" in expected:
                    self.assertGreaterEqual(
                        result.assessment.ethicalAlignment.score,
                        expected["ethicalAlignment"]["min"],
                        f"Ethical Alignment too low for {test_case['name']}"
                    )
                    self.assertLessEqual(
                        result.assessment.ethicalAlignment.score,
                        expected["ethicalAlignment"]["max"],
                        f"Ethical Alignment too high for {test_case['name']}"
                    )
                
                # Validate Resonance Quality
                if "resonanceQuality" in expected:
                    self.assertEqual(
                        result.assessment.resonanceQuality.level,
                        expected["resonanceQuality"]["level"],
                        f"Resonance Quality level mismatch for {test_case['name']}"
                    )
                
                # Validate Canvas Parity
                if "canvasParity" in expected:
                    self.assertGreaterEqual(
                        result.assessment.canvasParity.score,
                        expected["canvasParity"]["min"],
                        f"Canvas Parity too low for {test_case['name']}"
                    )
                    self.assertLessEqual(
                        result.assessment.canvasParity.score,
                        expected["canvasParity"]["max"],
                        f"Canvas Parity too high for {test_case['name']}"
                    )

    def test_ml_enhanced_detection_consistency(self):
        """Test ML-enhanced detection consistency with repeated assessments"""
        if not self.test_cases:
            self.skipTest("No test cases available")
        
        # Use the first test case for consistency testing
        test_case = self.test_cases[0]
        input_data = AssessmentInput(**test_case["input"])
        
        # Run multiple assessments
        results = []
        for _ in range(5):
            result = self.detector.analyzeContent(input_data)
            results.append(result)
        
        # Check consistency of Reality Index
        reality_scores = [r.assessment.realityIndex.score for r in results]
        max_deviation = max(reality_scores) - min(reality_scores)
        self.assertLessEqual(max_deviation, 1.0, "Reality Index scores show excessive variation")
        
        # Check consistency of Trust Protocol
        trust_statuses = [r.assessment.trustProtocol.status for r in results]
        self.assertEqual(len(set(trust_statuses)), 1, "Trust Protocol status is inconsistent")
        
        # Check consistency of Ethical Alignment
        ethical_scores = [r.assessment.ethicalAlignment.score for r in results]
        max_deviation = max(ethical_scores) - min(ethical_scores)
        self.assertLessEqual(max_deviation, 0.5, "Ethical Alignment scores show excessive variation")
        
        # Check consistency of Resonance Quality
        resonance_levels = [r.assessment.resonanceQuality.level for r in results]
        self.assertEqual(len(set(resonance_levels)), 1, "Resonance Quality level is inconsistent")
        
        # Check consistency of Canvas Parity
        canvas_scores = [r.assessment.canvasParity.score for r in results]
        max_deviation = max(canvas_scores) - min(canvas_scores)
        self.assertLessEqual(max_deviation, 10, "Canvas Parity scores show excessive variation")

    def test_ml_enhanced_detection_edge_cases(self):
        """Test ML-enhanced detection with edge cases"""
        edge_cases = [
            # Empty content
            {
                "name": "Empty Content",
                "input": {
                    "content": "",
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "General",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            },
            # Very short content
            {
                "name": "Very Short Content",
                "input": {
                    "content": "Hello world.",
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "General",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            },
            # Very long content
            {
                "name": "Very Long Content",
                "input": {
                    "content": "Lorem ipsum dolor sit amet. " * 1000,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "General",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            },
            # Content with special characters
            {
                "name": "Special Characters",
                "input": {
                    "content": "!@#$%^&*()_+{}|:<>?~`-=[]\\;',./\n\t",
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "General",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            },
            # Content with code
            {
                "name": "Code Content",
                "input": {
                    "content": """
                    ```python
                    def hello_world():
                        print("Hello, world!")
                        
                    if __name__ == "__main__":
                        hello_world()
                    ```
                    """,
                    "metadata": {
                        "source": "Test Model",
                        "author": "Test Author",
                        "context": "Technical",
                        "timestamp": "2023-01-01T00:00:00Z"
                    }
                }
            }
        ]
        
        for test_case in edge_cases:
            with self.subTest(test_case["name"]):
                # Prepare input
                input_data = AssessmentInput(**test_case["input"])
                
                try:
                    # Attempt to analyze content
                    result = self.detector.analyzeContent(input_data)
                    
                    # Verify that the result has all required fields
                    self.assertIsNotNone(result.assessment.id)
                    self.assertIsNotNone(result.assessment.timestamp)
                    self.assertIsNotNone(result.assessment.realityIndex)
                    self.assertIsNotNone(result.assessment.trustProtocol)
                    self.assertIsNotNone(result.assessment.ethicalAlignment)
                    self.assertIsNotNone(result.assessment.resonanceQuality)
                    self.assertIsNotNone(result.assessment.canvasParity)
                    self.assertIsNotNone(result.assessment.overallScore)
                    
                except Exception as e:
                    self.fail(f"ML-enhanced detector failed on {test_case['name']}: {str(e)}")

    def test_ml_enhanced_detection_performance(self):
        """Test ML-enhanced detection performance"""
        if not self.test_cases:
            self.skipTest("No test cases available")
        
        # Use the first test case for performance testing
        test_case = self.test_cases[0]
        input_data = AssessmentInput(**test_case["input"])
        
        # Run multiple assessments to measure performance
        iterations = 10
        start_time = time.time()
        
        for _ in range(iterations):
            self.detector.analyzeContent(input_data)
        
        end_time = time.time()
        total_time = end_time - start_time
        avg_time = total_time / iterations
        
        # Log performance metrics
        print(f"\nPerformance Test Results:")
        print(f"Total time for {iterations} iterations: {total_time:.2f} seconds")
        print(f"Average time per assessment: {avg_time:.2f} seconds")
        
        # Assert that performance is within acceptable limits
        self.assertLessEqual(avg_time, 5.0, "ML-enhanced detection is too slow")

    def tearDown(self):
        """Clean up after tests"""
        if self.performance_metrics['total_tests'] > 0:
            self.performance_metrics['avg_time'] = (
                self.performance_metrics['total_time'] / self.performance_metrics['total_tests']
            )
            
            print(f"\nPerformance Metrics:")
            print(f"Total tests: {self.performance_metrics['total_tests']}")
            print(f"Total time: {self.performance_metrics['total_time']:.2f} seconds")
            print(f"Average time: {self.performance_metrics['avg_time']:.2f} seconds")
            print(f"Maximum time: {self.performance_metrics['max_time']:.2f} seconds")
            print(f"Minimum time: {self.performance_metrics['min_time']:.2f} seconds")

if __name__ == '__main__':
    unittest.main()